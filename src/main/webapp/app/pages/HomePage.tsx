import * as React from 'react';
import { observable, action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { remoteData } from 'cbioportal-frontend-commons';
import oncokbPrivateClient from '../shared/api/oncokbPrivateClientInstance';
import {
  Gene,
  LevelNumber,
  TypeaheadSearchResp
} from 'app/shared/api/generated/OncoKbPrivateAPI';
import { Row, Col, Button, Tabs, Tab } from 'react-bootstrap';
import oncokbImg from 'content/images/oncokb.png';
import { HomePageNumber } from 'app/components/HomePageNumber';
import pluralize from 'pluralize';
import { LEVEL_BUTTON_DESCRIPTION, PAGE_ROUTE } from 'app/config/constants';
import { LevelButton } from 'app/components/levelButton/LevelButton';
import { levelOfEvidence2Level } from 'app/shared/utils/Utils';
import { RouterStore } from 'mobx-react-router';
import { CitationText } from 'app/components/CitationText';
import _ from 'lodash';
import AppStore from 'app/store/AppStore';
import OncoKBSearch from 'app/components/oncokbSearch/OncoKBSearch';
import '../index.scss';

interface IHomeProps {
  content: string;
  routing: RouterStore;
  appStore: AppStore;
}

export type ExtendedTypeaheadSearchResp = TypeaheadSearchResp & {
  alterationsName: string;
  tumorTypesName: string;
};

export enum LevelType {
  THERAPEUTIC,
  DIAGNOSTIC,
  PROGNOSTIC
}

const LevelTabTitles: { [key in LevelType]: string } = {
  [LevelType.THERAPEUTIC]: 'Therapeutic levels',
  [LevelType.DIAGNOSTIC]: 'Diagnostic levels',
  [LevelType.PROGNOSTIC]: 'Prognostic levels'
};

@inject('routing', 'appStore')
@observer
class HomePage extends React.Component<IHomeProps> {
  @observable keyword = '';

  private levelGadgets: {
    [key in LevelType]: {
      title?: string;
      description?: string;
      level: string;
      linkoutLevel: string;
      combinedLevels: string[];
    }[];
  } = {
    [LevelType.THERAPEUTIC]: [
      {
        level: '1',
        description: LEVEL_BUTTON_DESCRIPTION['1'],
        linkoutLevel: '1',
        combinedLevels: ['1']
      },
      {
        level: '2',
        description: LEVEL_BUTTON_DESCRIPTION['2'],
        linkoutLevel: '2',
        combinedLevels: ['2']
      },
      {
        level: '3',
        description: LEVEL_BUTTON_DESCRIPTION['3'],
        linkoutLevel: '3',
        combinedLevels: ['3']
      },
      {
        level: '4',
        description: LEVEL_BUTTON_DESCRIPTION['4'],
        linkoutLevel: '4',
        combinedLevels: ['4']
      },
      {
        level: 'R1',
        description: 'Resistance',
        title: 'Level R1/R2',
        linkoutLevel: 'R1,R2',
        combinedLevels: ['R1', 'R2']
      }
    ],
    [LevelType.DIAGNOSTIC]: [
      {
        level: 'Dx1',
        description: LEVEL_BUTTON_DESCRIPTION['Dx1'],
        linkoutLevel: 'Dx1',
        combinedLevels: ['Dx1']
      },
      {
        level: 'Dx2',
        description: LEVEL_BUTTON_DESCRIPTION['Dx2'],
        linkoutLevel: 'Dx2',
        combinedLevels: ['Dx2']
      },
      {
        level: 'Dx3',
        description: LEVEL_BUTTON_DESCRIPTION['Dx3'],
        linkoutLevel: 'Dx3',
        combinedLevels: ['Dx3']
      }
    ],
    [LevelType.PROGNOSTIC]: [
      {
        level: 'Px1',
        description: LEVEL_BUTTON_DESCRIPTION['Px1'],
        linkoutLevel: 'Px1',
        combinedLevels: ['Px1']
      },
      {
        level: 'Px2',
        description: LEVEL_BUTTON_DESCRIPTION['Px2'],
        linkoutLevel: 'Px2',
        combinedLevels: ['Px2']
      },
      {
        level: 'Px3',
        description: LEVEL_BUTTON_DESCRIPTION['Px3'],
        linkoutLevel: 'Px3',
        combinedLevels: ['Px3']
      }
    ]
  };

  readonly levelNumbers = remoteData<{ [level: string]: LevelNumber }>({
    await: () => [],
    async invoke() {
      const levelNumber = await oncokbPrivateClient.utilsNumbersLevelsGetUsingGET(
        {}
      );
      return Promise.resolve(
        _.reduce(
          levelNumber,
          (acc, next) => {
            acc[levelOfEvidence2Level(next.level, true)] = next;
            return acc;
          },
          {} as { [level: string]: LevelNumber }
        )
      );
    },
    default: {}
  });

  getLevelNumber(levels: string[]) {
    return _.uniq(
      _.reduce(
        levels,
        (acc, level) => {
          acc.push(
            ...(this.levelNumbers.result[level]
              ? this.levelNumbers.result[level].genes
              : [])
          );
          return acc;
        },
        [] as Gene[]
      )
    ).length;
  }

  public render() {
    return (
      <div className="home">
        <Row className="mb-5">
          <Col
            md={6}
            className={'mx-auto d-flex flex-column align-items-center '}
          >
            <img src={oncokbImg} className="home-page-logo" />
            <span className="home-page-logo-title">
              Precision Oncology Knowledge Base
            </span>
          </Col>
        </Row>
        <Row className="mb-5">
          <Col md={8} className={'mx-auto'}>
            <Row>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  href={'/cancerGenes'}
                  number={this.props.appStore.mainNumbers.result.gene}
                  title={`${pluralize(
                    'Gene',
                    this.props.appStore.mainNumbers.result.gene
                  )}`}
                />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  number={this.props.appStore.mainNumbers.result.alteration}
                  title={`${pluralize(
                    'Alteration',
                    this.props.appStore.mainNumbers.result.alteration
                  )}`}
                />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  href={PAGE_ROUTE.ACTIONABLE_GENE}
                  number={this.props.appStore.mainNumbers.result.tumorType}
                  title={`${pluralize(
                    'Tumor Type',
                    this.props.appStore.mainNumbers.result.tumorType
                  )}`}
                />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <HomePageNumber
                  href={PAGE_ROUTE.ACTIONABLE_GENE}
                  number={this.props.appStore.mainNumbers.result.drug}
                  title={`${pluralize(
                    'Drug',
                    this.props.appStore.mainNumbers.result.drug
                  )}`}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mb-5">
          <Col md={8} className={'mx-auto'}>
            <OncoKBSearch />
          </Col>
        </Row>
        <Row className={'mb-5'}>
          <Col xs={0} lg={1}></Col>
          <Col xs={12} lg={10}>
            {/*<Tabs*/}
            {/*  defaultActiveKey={LevelType.THERAPEUTIC}*/}
            {/*  id="home-tabs"*/}
            {/*  className={'home-tabs'}*/}
            {/*>*/}
            {/*  {[*/}
            {/*    LevelType.THERAPEUTIC,*/}
            {/*    LevelType.DIAGNOSTIC,*/}
            {/*    LevelType.PROGNOSTIC*/}
            {/*  ].map(levelType => (*/}
            {/*    <Tab eventKey={levelType} title={LevelTabTitles[levelType]}>*/}
            {/*      <div className={'d-flex justify-content-center mt-3'}>*/}
            {/*        {this.levelGadgets[levelType].map(levelGadget => (*/}
            {/*          <LevelButton*/}
            {/*            level={levelGadget.level}*/}
            {/*            numOfGenes={this.getLevelNumber(*/}
            {/*              levelGadget.combinedLevels*/}
            {/*            )}*/}
            {/*            description={levelGadget.description}*/}
            {/*            title={levelGadget.title}*/}
            {/*            className="mb-2"*/}
            {/*            href={`/actionableGenes#levels=${levelGadget.linkoutLevel}`}*/}
            {/*          />*/}
            {/*        ))}*/}
            {/*      </div>*/}
            {/*    </Tab>*/}
            {/*  ))}*/}
            {/*</Tabs>*/}

            <div className={'d-flex flex-column'}>
              <div className={'d-flex justify-content-center'}>
                {[
                  LevelType.THERAPEUTIC,
                  LevelType.DIAGNOSTIC,
                  LevelType.PROGNOSTIC
                ].map((levelType, index) => (
                  <Button
                    style={
                      index === 0
                        ? {
                            backgroundColor: '#1c75cd',
                            color: 'white'
                          }
                        : undefined
                    }
                    variant={'light'}
                    className={'mx-2'}
                  >
                    {LevelTabTitles[levelType]}
                  </Button>
                ))}
              </div>
              <div className={'d-flex justify-content-center mt-2'}>
                {this.levelGadgets[LevelType.THERAPEUTIC].map(levelGadget => (
                  <LevelButton
                    level={levelGadget.level}
                    numOfGenes={this.getLevelNumber(levelGadget.combinedLevels)}
                    description={levelGadget.description}
                    title={levelGadget.title}
                    className="mb-2"
                    href={`/actionableGenes#levels=${levelGadget.linkoutLevel}`}
                  />
                ))}
              </div>
            </div>
          </Col>
          <Col xs={0} lg={1}></Col>
        </Row>
        <Row className="mb-3">
          <Col className={'text-center'}>
            <div className={'font-weight-bold'}>
              Powered by the clinical expertise of Memorial Sloan Kettering
              Cancer Center
            </div>
            <div>
              <CitationText boldLinkout={true} />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default HomePage;
