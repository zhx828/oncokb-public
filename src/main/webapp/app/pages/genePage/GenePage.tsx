import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  AnnotationStore,
  FdaImplication,
  TherapeuticImplication,
} from 'app/store/AnnotationStore';
import {
  action,
  computed,
  IReactionDisposer,
  observable,
  reaction,
} from 'mobx';
import { Else, If, Then } from 'react-if';
import { Redirect, RouteComponentProps } from 'react-router';
import { Col, Row } from 'react-bootstrap';
import {
  getCancerTypeNameFromOncoTreeType,
  getCancerTypesName,
  getPageTitle,
} from 'app/shared/utils/Utils';
import LoadingIndicator, {
  LoaderSize,
} from 'app/components/loadingIndicator/LoadingIndicator';
import autobind from 'autobind-decorator';
import BarChart from 'app/components/barChart/BarChart';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import {
  ANNOTATION_PAGE_TAB_KEYS,
  DEFAULT_GENE,
  LEVEL_CLASSIFICATION,
  LEVEL_TYPES,
  ONCOGENIC_MUTATIONS,
  PAGE_ROUTE,
  REFERENCE_GENOME,
} from 'app/config/constants';
import { ClinicalVariant } from 'app/shared/api/generated/OncoKbPrivateAPI';
import { AlterationPageLink } from 'app/shared/utils/UrlUtils';
import AppStore from 'app/store/AppStore';
import { MskimpactLink } from 'app/components/MskimpactLink';
import WindowStore from 'app/store/WindowStore';
import { DataFilterType, onFilterOptionSelect } from 'react-mutation-mapper';
import { CANCER_TYPE_FILTER_ID } from 'app/components/oncokbMutationMapper/FilterUtils';
import DocumentTitle from 'react-document-title';
import { UnknownGeneAlert } from 'app/shared/alert/UnknownGeneAlert';
import WithSeparator from 'react-with-separator';
import { FeedbackIcon } from 'app/components/feedback/FeedbackIcon';
import { FeedbackType } from 'app/components/feedback/types';
import * as QueryString from 'query-string';
import { RouterStore } from 'mobx-react-router';
import {
  GenePageHashQueries,
  GenePageSearchQueries,
} from 'app/shared/route/types';
import AlterationTableTabs from 'app/pages/annotationPage/AlterationTableTabs';
import GeneInfo from './GeneInfo';
import GeneAdditionalInfoTable from 'app/pages/genePage/GeneAdditionalInfoTable';
import OncokbLollipopPlot from './OncokbLollipopPlot';
import { getUniqueFdaImplications } from 'app/pages/annotationPage/Utils';
import ShowHideText from 'app/shared/texts/ShowHideText';
import { AnnotationType } from 'app/pages/annotationPage/AnnotationPage';
import SummaryWithRefs from 'app/oncokb-frontend-commons/src/components/SummaryWithRefs';
import { findLast } from 'app/shared/utils/LodashUtils';

interface MatchParams {
  hugoSymbol: string;
}

interface GenePageProps extends RouteComponentProps<MatchParams> {
  appStore: AppStore;
  windowStore: WindowStore;
  routing: RouterStore;
}

@inject('appStore', 'windowStore', 'routing')
@observer
export default class GenePage extends React.Component<GenePageProps, any> {
  @observable hugoSymbolQuery: string;
  @observable showGeneBackground: boolean;
  @observable selectedTab: ANNOTATION_PAGE_TAB_KEYS;
  @observable defaultSelectedTab: ANNOTATION_PAGE_TAB_KEYS;

  private store: AnnotationStore;
  readonly reactions: IReactionDisposer[] = [];

  getAlterationsByLevelType(
    alterations: ClinicalVariant[],
    levelType: LEVEL_TYPES
  ) {
    return alterations.filter(alt => {
      return LEVEL_CLASSIFICATION[alt.level] === levelType;
    });
  }

  @computed
  get filteredTxAlterations() {
    if (this.store.filteredClinicalAlterations.length === 0) {
      return [];
    }
    return this.getAlterationsByLevelType(
      this.store.filteredClinicalAlterations,
      LEVEL_TYPES.TX
    );
  }

  getClinicalImplications(
    clinicalVariants: ClinicalVariant[]
  ): TherapeuticImplication[] {
    return clinicalVariants.reduce((acc, variant) => {
      const cancerTypeNames = variant.cancerTypes.map(cancerType =>
        getCancerTypeNameFromOncoTreeType(cancerType)
      );
      const excludedCancerTypeNames = variant.excludedCancerTypes.map(
        cancerType => getCancerTypeNameFromOncoTreeType(cancerType)
      );
      const alterationView = variant.variant.consequence ? (
        <AlterationPageLink
          key={variant.variant.name}
          hugoSymbol={this.store.hugoSymbol}
          alteration={{
            alteration: variant.variant.alteration,
            name: variant.variant.name,
          }}
          alterationRefGenomes={
            variant.variant.referenceGenomes as REFERENCE_GENOME[]
          }
        />
      ) : (
        <span>{variant.variant.name}</span>
      );
      const cancerTypesName = getCancerTypesName(
        cancerTypeNames,
        excludedCancerTypeNames
      );
      const cancerTypesView = (
        <>
          <WithSeparator separator={', '}>
            {cancerTypeNames.map(cancerType =>
              variant.variant.consequence ? (
                <AlterationPageLink
                  key={`${variant.variant.name}-${cancerType}`}
                  hugoSymbol={this.store.hugoSymbol}
                  alteration={{
                    alteration: variant.variant.alteration,
                    name: variant.variant.name,
                  }}
                  alterationRefGenomes={
                    variant.variant.referenceGenomes as REFERENCE_GENOME[]
                  }
                  cancerType={cancerType}
                >
                  {cancerType}
                </AlterationPageLink>
              ) : (
                <span>{cancerType}</span>
              )
            )}
          </WithSeparator>
          {excludedCancerTypeNames.length > 0 ? (
            <span> (excluding {excludedCancerTypeNames.join(', ')})</span>
          ) : (
            <></>
          )}
        </>
      );
      if (variant.drug.length > 0) {
        variant.drug.forEach(drug => {
          acc.push({
            level: variant.level,
            alterations: variant.variant.name,
            alterationsView: alterationView,
            drugs: drug,
            cancerTypes: cancerTypesName,
            drugDescription: variant.drugDescription,
            cancerTypesView,
            citations: {
              abstracts: variant.drugAbstracts,
              pmids: variant.drugPmids,
            },
          });
        });
      } else {
        acc.push({
          level: variant.level,
          alterations: variant.variant.name,
          alterationsView: alterationView,
          drugs: '',
          cancerTypes: cancerTypesName,
          drugDescription: variant.drugDescription,
          cancerTypesView,
          citations: {
            abstracts: variant.drugAbstracts,
            pmids: variant.drugPmids,
          },
        });
      }
      return acc;
    }, [] as TherapeuticImplication[]);
  }

  getFdaImplication(clinicalVariants: ClinicalVariant[]): FdaImplication[] {
    const fdaImplications: FdaImplication[] = [];
    clinicalVariants.forEach(clinicalVariant => {
      let variants: ClinicalVariant[] = [clinicalVariant];
      // we want to link all oncogenic mutations with Oncogenic Mutations clinical variant
      if (clinicalVariant.variant.name === ONCOGENIC_MUTATIONS) {
        variants = this.store.oncogenicBiologicalVariants.map(
          biologicalVariant => ({
            ...clinicalVariant,
            variant: biologicalVariant.variant,
          })
        );
      }
      variants.forEach(variant => {
        const ctNames = variant.cancerTypes.map(ct =>
          getCancerTypeNameFromOncoTreeType(ct)
        );
        const excludedCtNames = variant.excludedCancerTypes.map(ct =>
          getCancerTypeNameFromOncoTreeType(ct)
        );
        fdaImplications.push({
          level: variant.fdaLevel,
          alteration: variant.variant,
          alterationView: (
            <AlterationPageLink
              key={`${variant.variant.name}`}
              hugoSymbol={this.store.hugoSymbol}
              alteration={{
                alteration: variant.variant.alteration,
                name: variant.variant.name,
              }}
              hashQueries={{
                tab: ANNOTATION_PAGE_TAB_KEYS.FDA,
              }}
            >
              {variant.variant.name}
            </AlterationPageLink>
          ),
          cancerType: getCancerTypesName(ctNames, excludedCtNames),
          cancerTypeView: (
            <>
              <WithSeparator separator={', '}>
                {ctNames.map(cancerType => (
                  <AlterationPageLink
                    key={`${variant.variant.name}-${cancerType}`}
                    hugoSymbol={this.store.hugoSymbol}
                    alteration={{
                      alteration: variant.variant.alteration,
                      name: variant.variant.name,
                    }}
                    alterationRefGenomes={
                      variant.variant.referenceGenomes as REFERENCE_GENOME[]
                    }
                    cancerType={cancerType}
                  >
                    {cancerType}
                  </AlterationPageLink>
                ))}
              </WithSeparator>
              {excludedCtNames.length > 0 ? (
                <span> (excluding {excludedCtNames.join(', ')})</span>
              ) : (
                <></>
              )}
            </>
          ),
        });
      });
    });
    return getUniqueFdaImplications(fdaImplications);
  }

  @computed
  get filteredDxAlterations() {
    if (this.store.filteredClinicalAlterations.length === 0) {
      return [];
    }
    return this.getAlterationsByLevelType(
      this.store.filteredClinicalAlterations,
      LEVEL_TYPES.DX
    );
  }

  @computed
  get filteredPxAlterations() {
    if (this.store.filteredClinicalAlterations.length === 0) {
      return [];
    }
    return this.getAlterationsByLevelType(
      this.store.filteredClinicalAlterations,
      LEVEL_TYPES.PX
    );
  }

  constructor(props: any) {
    super(props);
    this.hugoSymbolQuery = props.match.params
      ? props.match.params.hugoSymbol
      : undefined;
    this.store = new AnnotationStore({
      type: AnnotationType.GENE,
      hugoSymbolQuery: this.hugoSymbolQuery,
    });
    const queryStringsHash = QueryString.parse(
      window.location.hash
    ) as GenePageHashQueries;
    if (queryStringsHash.tab) {
      this.selectedTab = queryStringsHash.tab;
    }

    this.props.appStore.toFdaRecognizedContent = false;
    this.reactions.push(
      reaction(
        () => this.defaultShowGeneBackground,
        defaultShowGeneBackground => {
          if (
            this.showGeneBackground === undefined &&
            defaultShowGeneBackground !== undefined
          ) {
            this.showGeneBackground = defaultShowGeneBackground;
          }
        }
      ),
      reaction(
        () => [props.routing.location.search],
        ([search]) => {
          const queryStrings = QueryString.parse(
            search
          ) as GenePageSearchQueries;
          if (queryStrings.refGenome) {
            this.store.referenceGenomeQuery = queryStrings.refGenome;
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => [props.routing.location.hash],
        ([hash]) => {
          const queryStrings = QueryString.parse(hash) as GenePageHashQueries;
          if (queryStrings.tab) {
            this.defaultSelectedTab = queryStrings.tab;
            if (queryStrings.tab === ANNOTATION_PAGE_TAB_KEYS.FDA) {
              this.props.appStore.inFdaRecognizedContent = true;
            }
          }
        },
        true
      )
    );
  }

  componentDidUpdate(prevProps: any) {
    if (
      this.props.match.params.hugoSymbol !== prevProps.match.params.hugoSymbol
    ) {
      this.hugoSymbolQuery = this.props.match.params.hugoSymbol;
      this.store.hugoSymbolQuery = this.hugoSymbolQuery;
    }
  }

  @autobind
  @action
  toggleGeneBackground() {
    this.showGeneBackground = !this.showGeneBackground;
  }

  @autobind
  @action
  onChangeTab(
    selectedTab: ANNOTATION_PAGE_TAB_KEYS,
    newTabKey: ANNOTATION_PAGE_TAB_KEYS
  ) {
    if (newTabKey === ANNOTATION_PAGE_TAB_KEYS.FDA) {
      this.props.appStore.inFdaRecognizedContent = true;
    }
    if (
      selectedTab === ANNOTATION_PAGE_TAB_KEYS.FDA &&
      newTabKey !== ANNOTATION_PAGE_TAB_KEYS.FDA
    ) {
      this.props.appStore.showFdaModal = true;
    } else {
      const newHash: GenePageHashQueries = { tab: newTabKey };
      window.location.hash = QueryString.stringify(newHash);
    }
  }

  @computed
  get pageShouldBeRendered() {
    return (
      this.store.geneNumber.isComplete &&
      this.store.gene.isComplete &&
      this.store.clinicalAlterations.isComplete &&
      this.store.biologicalAlterations.isComplete
    );
  }

  @computed
  get genePanelClass() {
    if (this.store.barChartData.length > 0) {
      return {
        xl: 8,
        lg: 8,
        xs: 12,
      };
    } else {
      return {
        xl: 12,
        lg: 12,
        xs: 12,
      };
    }
  }

  @computed
  get defaultShowGeneBackground() {
    if (this.store.biologicalAlterations.isComplete) {
      return this.store.biologicalAlterations.result.length === 0;
    } else {
      return undefined;
    }
  }

  componentWillUnmount(): void {
    for (const reactionItem of this.reactions) {
      reactionItem();
    }
    this.store.destroy();
  }

  render() {
    return (
      <DocumentTitle title={getPageTitle(`${this.store.hugoSymbol}`)}>
        <If condition={!!this.hugoSymbolQuery}>
          <Then>
            <If condition={this.store.gene.isComplete}>
              <Then>
                {this.store.gene.isError ||
                this.store.gene.result === DEFAULT_GENE ? (
                  <UnknownGeneAlert />
                ) : (
                  <If condition={this.pageShouldBeRendered}>
                    <Then>
                      <h2>
                        {this.store.hugoSymbol}
                        <span style={{ fontSize: '0.5em' }} className={'ml-2'}>
                          <FeedbackIcon
                            feedback={{
                              type: FeedbackType.ANNOTATION,
                              annotation: {
                                gene: this.store.hugoSymbol,
                              },
                            }}
                            appStore={this.props.appStore}
                          />
                        </span>
                      </h2>
                      <Row>
                        <Col md={8}>
                          <div className="">
                            <GeneInfo
                              gene={this.store.gene.result}
                              ensemblGenes={this.store.ensemblGenes.result}
                              highestSensitiveLevel={
                                this.store.geneNumber.result
                                  .highestSensitiveLevel
                              }
                              highestResistanceLevel={
                                this.store.geneNumber.result
                                  .highestResistanceLevel
                              }
                              highestDiagnosticImplicationLevel={
                                this.store.geneNumber.result
                                  .highestDiagnosticImplicationLevel
                              }
                              highestPrognosticImplicationLevel={
                                this.store.geneNumber.result
                                  .highestPrognosticImplicationLevel
                              }
                              highestFdaLevel={
                                this.store.geneNumber.result.highestFdaLevel
                              }
                            />
                            {this.store.geneSummary.result && (
                              <div className="mt-2">
                                <SummaryWithRefs
                                  content={this.store.geneSummary.result}
                                  type="linkout"
                                />
                              </div>
                            )}
                            {this.store.geneBackground.result && (
                              <ShowHideText
                                show={this.showGeneBackground}
                                title={`${this.store.hugoSymbol} background`}
                                content={
                                  <SummaryWithRefs
                                    content={this.store.geneBackground.result}
                                    type="linkout"
                                  />
                                }
                                onClick={this.toggleGeneBackground}
                              />
                            )}
                          </div>
                        </Col>
                        <Col md={4} style={{ fontSize: '0.8rem' }}>
                          <GeneAdditionalInfoTable
                            gene={this.store.gene.result}
                            grch37ensemblGene={findLast(
                              this.store.ensemblGenes.result,
                              item =>
                                item.referenceGenome === REFERENCE_GENOME.GRCh37
                            )}
                            grch38ensemblGene={findLast(
                              this.store.ensemblGenes.result,
                              item =>
                                item.referenceGenome === REFERENCE_GENOME.GRCh38
                            )}
                          />
                        </Col>
                      </Row>
                      <If
                        condition={
                          this.store.gene.result.entrezGeneId > 0 &&
                          this.store.mutationMapperDataPortal.result.length > 0
                        }
                      >
                        <Row className={'mt-5'}>
                          <Col
                            xl={this.genePanelClass.xl}
                            lg={this.genePanelClass.lg}
                            xs={this.genePanelClass.xs}
                          >
                            <h6>
                              Annotated Mutations in <MskimpactLink />
                            </h6>
                            <OncokbLollipopPlot
                              store={this.store}
                              windowStore={this.props.windowStore}
                              showPlotControlsOnHover={true}
                            />
                          </Col>
                          {this.store.barChartData.length > 0 ? (
                            <Col
                              xl={12 - this.genePanelClass.xl}
                              lg={12 - this.genePanelClass.lg}
                              xs={12 - this.genePanelClass.xs}
                              className={
                                'd-flex flex-column align-items-center'
                              }
                            >
                              <h6>
                                Cancer Types with {this.store.hugoSymbol}{' '}
                                Mutations
                                <DefaultTooltip
                                  overlay={() => (
                                    <div style={{ maxWidth: 300 }}>
                                      Currently, the mutation frequency does not
                                      take into account copy number changes,
                                      chromosomal translocations or cancer types
                                      with fewer than 50 samples in{' '}
                                      <MskimpactLink />
                                    </div>
                                  )}
                                >
                                  <i className="fa fa-question-circle-o ml-2" />
                                </DefaultTooltip>
                              </h6>
                              <BarChart
                                data={this.store.barChartData}
                                height={300}
                                filters={this.store.selectedCancerTypes}
                                windowStore={this.props.windowStore}
                                onUserSelection={selectedCancerTypes =>
                                  this.store.mutationMapperStore &&
                                  this.store.mutationMapperStore.result
                                    ? onFilterOptionSelect(
                                        selectedCancerTypes,
                                        false,
                                        this.store.mutationMapperStore.result
                                          .dataStore,
                                        DataFilterType.CANCER_TYPE,
                                        CANCER_TYPE_FILTER_ID
                                      )
                                    : undefined
                                }
                              />
                            </Col>
                          ) : null}
                        </Row>
                      </If>
                      <Row className={'mt-2'}>
                        <Col>
                          <AlterationTableTabs
                            selectedTab={this.defaultSelectedTab}
                            hugoSymbol={this.store.hugoSymbol}
                            biological={
                              this.store.filteredBiologicalAlterations
                            }
                            tx={this.getClinicalImplications(
                              this.filteredTxAlterations
                            )}
                            dx={this.getClinicalImplications(
                              this.filteredDxAlterations
                            )}
                            px={this.getClinicalImplications(
                              this.filteredPxAlterations
                            )}
                            fda={this.getFdaImplication(
                              this.filteredTxAlterations
                            )}
                            onChangeTab={this.onChangeTab}
                          />
                        </Col>
                      </Row>
                    </Then>
                    <Else>
                      <LoadingIndicator
                        size={LoaderSize.LARGE}
                        center={true}
                        isLoading={this.store.gene.isPending}
                      />
                    </Else>
                  </If>
                )}
              </Then>
              <Else>
                <LoadingIndicator
                  size={LoaderSize.LARGE}
                  center={true}
                  isLoading={this.store.gene.isPending}
                />
              </Else>
            </If>
          </Then>
          <Else>
            <Redirect to={PAGE_ROUTE.HOME} />
          </Else>
        </If>
      </DocumentTitle>
    );
  }
}
