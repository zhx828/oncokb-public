import * as React from 'react';
import { observer } from 'mobx-react';
import { remoteData, isWebdriver } from 'cbioportal-frontend-commons';
import { action, computed, observable } from 'mobx';
import autobind from 'autobind-decorator';
import * as _ from 'lodash';
import styles from './styles.module.scss';
import classNames from 'classnames';
import { getBrowserWindow } from 'cbioportal-frontend-commons';
import { Container } from 'react-bootstrap';
import WindowStore from 'app/store/WindowStore';

export interface IUserMessage {
  dateStart?: number;
  dateEnd: number;
  content: string;
  id: string;
}

function makeMessageKey(id: string) {
  return `portalMessageKey-${id}`;
}

// ADD MESSAGE IN FOLLOWING FORMAT
// UNIQUE ID IS IMPORTANT B/C WE REMEMBER A MESSAGE HAS BEEN SHOWN
// BASED ON USERS LOCALSTORAGE
let MESSAGE_DATA: IUserMessage[];

if (
  ['beta.oncokb.org', 'www.oncokb.org', 'localhost'].includes(
    getBrowserWindow().location.hostname
  )
) {
  MESSAGE_DATA = [
    // ADD MESSAGE IN FOLLOWING FORMAT
    // UNIQUE ID IS IMPORTANT B/C WE REMEMBER A MESSAGE HAS BEEN SHOWN
    // BASED ON USERS LOCALSTORAGE
    {
      dateEnd: 100000000000000,
      content: `On Wednesday June 10th, we will participate in <a class="btn btn-primary btn-sm" target="_blank" href="https://www.shutdownstem.com/">#ShutDownAcademia</a>. We encourage everyone to participate. We will educate ourselves and consider how we can support the <a class="btn btn-primary btn-sm" target="_blank" href="https://blacklivesmatter.com">#BLM</a> movement. The website will be online for those who need it.`,
      id: '20200610_blm'
    }
  ];
}

@observer
export default class UserMessager extends React.Component<
  {
    dataUrl?: string;
    windowStore: WindowStore;
  },
  {}
> {
  messageData = remoteData<IUserMessage[]>(async () => {
    return Promise.resolve(MESSAGE_DATA);
  });

  @observable dismissed = false;

  get shownMessage() {
    const messageToShow = _.find(this.messageData.result, message => {
      const notYetShown = !localStorage.getItem(makeMessageKey(message.id));
      const expired = Date.now() > message.dateEnd;
      return notYetShown && !expired;
    });

    return messageToShow;
  }

  @autobind
  close() {
    this.markMessageDismissed(this.shownMessage!);
  }

  @action
  markMessageDismissed(message: IUserMessage) {
    localStorage.setItem(makeMessageKey(message.id), 'shown');
    this.dismissed = true;
  }

  render() {
    if (!this.dismissed && this.messageData.isComplete && this.shownMessage) {
      return (
        <div className={styles.messager}>
          <Container
            fluid={!this.props.windowStore.isXLscreen}
            className={styles.messagerContainer}
          >
            <div
              className={styles.message}
              dangerouslySetInnerHTML={{
                __html: this.shownMessage.content
              }}
            ></div>
            <i
              className={classNames(styles.close, 'fa', 'fa-close')}
              onClick={this.close}
            />
          </Container>
        </div>
      );
    } else {
      return null;
    }
  }
}
