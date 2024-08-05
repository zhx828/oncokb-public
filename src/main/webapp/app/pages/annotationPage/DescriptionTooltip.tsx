import React from 'react';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';

export const DescriptionTooltip: React.FunctionComponent<{
  description: JSX.Element;
}> = props => {
  return (
    <DefaultTooltip placement={'right'} overlay={props.description}>
      <span>
        <i className="fa fa-book" />
      </span>
    </DefaultTooltip>
  );
};
