import * as React from 'react';

import mskBlackLogo from 'content/images/msk/msk-logo-black.svg';
import mskBlackIcon from 'content/images/msk/msk-icon-black.svg';
import mskWhiteLogo from 'content/images/msk/msk-logo-white.svg';
import mskWhiteIcon from 'content/images/msk/msk-icon-white.svg';
import OptimizedImage from 'app/shared/image/OptimizedImage';

class MskccLogo extends React.Component<{
  color: 'white' | 'blue' | 'black';
  imageHeight?: number;
  size?: 'sm' | 'lg';
  className?: string;
}> {
  public static defaultProps = {
    size: 'lg',
  };
  public render() {
    let mskLogo;
    let mskIcon;
    switch (this.props.color) {
      case 'black':
        mskLogo = mskBlackLogo;
        mskIcon = mskBlackIcon;
        break;
      default:
        mskLogo = mskWhiteLogo;
        mskIcon = mskWhiteIcon;
        break;
    }
    return (
      <a
        href="https://www.mskcc.org"
        target="_blank"
        rel="noopener noreferrer"
        className={this.props.className}
        style={{ display: 'block' }}
      >
        <OptimizedImage
          alt="mskcc-logo"
          src={this.props.size === 'lg' ? mskLogo : mskIcon}
          style={{
            height: this.props.imageHeight || 50,
          }}
        />
      </a>
    );
  }
}

export default MskccLogo;
