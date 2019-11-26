import React from 'react';
import { inject, observer } from 'mobx-react';
import {
  AnnotationStore,
  TherapeuticImplication
} from 'app/store/AnnotationStore';
import { computed, action, IReactionDisposer, reaction } from 'mobx';
import { Col, Row } from 'react-bootstrap';
import AppStore from 'app/store/AppStore';
import _ from 'lodash';
import Select from 'react-select';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import autobind from 'autobind-decorator';
import {
  DEFAULT_MARGIN_BOTTOM_SM,
  TABLE_COLUMN_KEY,
  THRESHOLD_ALTERATION_PAGE_TABLE_FIXED_HEIGHT
} from 'app/config/constants';
import OncoKBTable, {
  SearchColumn
} from 'app/components/oncokbTable/OncoKBTable';
import {
  getDefaultColumnDefinition,
  OncoKBOncogenicityIcon,
  reduceJoin
} from 'app/shared/utils/Utils';
import { GenePageLink } from 'app/shared/utils/UrlUtils';
import { CitationTooltip } from 'app/components/CitationTooltip';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import { RouterStore } from 'mobx-react-router';
import { getHighestLevelStrings } from '../genePage/GenePage';
import styles from './AlterationPage.module.scss';
import classnames from 'classnames';
import SmallPageContainer from 'app/components/SmallPageContainer';
import InfoIcon from 'app/shared/icons/InfoIcon';
import { EnsemblStore } from 'app/store/EnsemblStore';

enum SummaryKey {
  GENE_SUMMARY = 'geneSummary',
  ALTERATION_SUMMARY = 'variantSummary',
  TUMOR_TYPE_SUMMARY = 'tumorTypeSummary',
  DIAGNOSTIC_SUMMARY = 'diagnosticSummary',
  PROGNOSTIC_SUMMARY = 'prognosticSummary'
}

const SUMMARY_TITLE = {
  [SummaryKey.GENE_SUMMARY]: 'Gene Summary',
  [SummaryKey.ALTERATION_SUMMARY]: 'Alteration Summary',
  [SummaryKey.TUMOR_TYPE_SUMMARY]: 'Tumor Type Summary',
  [SummaryKey.DIAGNOSTIC_SUMMARY]: 'Diagnostic Summary',
  [SummaryKey.PROGNOSTIC_SUMMARY]: 'Prognostic Summary'
};

const AlterationInfo: React.FunctionComponent<{
  oncogenicity: string;
  mutationEffect: string;
  isVus: boolean;
  highestSensitiveLevel: string | undefined;
  highestResistanceLevel: string | undefined;
}> = props => {
  const separator = <span className="mx-1">·</span>;
  const content = [];
  if (props.oncogenicity) {
    content.push(
      <>
        <span key="oncogenicity">{props.oncogenicity}</span>
        <OncoKBOncogenicityIcon
          oncogenicity={props.oncogenicity}
          isVus={props.isVus}
        />
      </>
    );
  }
  if (props.mutationEffect) {
    content.push(<span key="mutationEffect">{props.mutationEffect}</span>);
  }
  if (props.highestSensitiveLevel || props.highestResistanceLevel) {
    content.push(
      getHighestLevelStrings(
        props.highestSensitiveLevel,
        props.highestResistanceLevel,
        separator
      )
    );
  }
  return (
    <div className="mt-2">
      <h5 className={'d-flex align-items-center'}>
        {reduceJoin(content, separator)}
      </h5>
    </div>
  );
};

@inject('appStore', 'routing')
@observer
export default class EnsemblPage extends React.Component<
  { appStore: AppStore; routing: RouterStore },
  {}
> {
  private store: AnnotationStore;
  private ensemblStore: EnsemblStore = new EnsemblStore();

  readonly reactions: IReactionDisposer[] = [];

  constructor(props: any) {
    super(props);
    if (props.match.params) {
      console.log(props.match.params.variantRecorderIdstore);
      if (props.match.params.variantRecorderId) {
        this.ensemblStore.variantRecorderId =
          props.match.params.variantRecorderId;
      }
    }
  }

  render() {
    return (
      <>
        {this.ensemblStore.ensembleVRData.isPending && (
          <LoadingIndicator size={'big'} center={true} isLoading={true} />
        )}
        {this.ensemblStore.ensembleVRData.isComplete && (
          <span>{this.ensemblStore.ensembleVRData.result.length}</span>
        )}
      </>
    );
  }
}
