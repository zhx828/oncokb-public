import React, { CSSProperties } from 'react';
import { observer } from 'mobx-react';
import request from 'superagent';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { ArticleAbstract } from 'app/shared/api/generated/OncoKbAPI';
import PmidItem from 'app/components/PmidItem';
import ArticleAbstractItem from 'app/components/ArticleAbstractItem';
import { TOOLTIP_MAX_HEIGHT } from 'app/config/constants';
import { remoteData } from 'app/shared/api/remoteData';

@observer
export class CitationTooltip extends React.Component<
  { pmids: string[]; abstracts: ArticleAbstract[]; style?: CSSProperties },
  {}
> {
  readonly citationContent = remoteData<any>({
    invoke: async () => {
      const result = await request.get(
        'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=' +
          this.props.pmids.join(',')
      );
      return Promise.resolve(result.body);
    },
  });

  findContent(pmid: string) {
    return this.citationContent.result.result[pmid];
  }

  getPmidItems() {
    return this.props.pmids.map(pmid => {
      const data = this.findContent(pmid);
      return data ? (
        <PmidItem
          key={pmid}
          title={data.title}
          author={
            Array.isArray(data.authors) && data.authors.length > 0
              ? data.authors[0].name + ' et al.'
              : 'Unknown'
          }
          source={data.source}
          date={new Date(data.pubdate).getFullYear().toString()}
          pmid={data.uid}
        />
      ) : null;
    });
  }

  render() {
    const style = {
      maxHeight: TOOLTIP_MAX_HEIGHT,
      overflowY: 'scroll',
      ...this.props.style,
    } as CSSProperties;
    return (
      <div>
        {this.citationContent.isPending ? (
          <LoadingIndicator isLoading={true} />
        ) : (
          <div style={style}>
            {this.getPmidItems()}
            {this.props.abstracts.map(abstract => (
              <ArticleAbstractItem
                key={abstract.abstract}
                abstract={abstract.abstract}
                link={abstract.link}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}
