import React from 'react';
import { RouterStore } from 'mobx-react-router';
import * as QueryString from 'query-string';
import client from 'app/shared/api/clientInstance';
import { observable } from 'mobx';
import LoadingIndicator from 'app/components/loadingIndicator/LoadingIndicator';
import { Link } from 'react-router-dom';
import { ONCOKB_TM, PAGE_ROUTE } from 'app/config/constants';
import { inject, observer } from 'mobx-react';
import { Alert } from 'react-bootstrap';
import SmallPageContainer from '../SmallPageContainer';
import MessageToContact from 'app/shared/texts/MessageToContact';
import * as styles from '../../index.module.scss';
import { remoteData } from 'app/shared/api/remoteData';

@inject('routing')
@observer
export default class ActivateAccount extends React.Component<{
  routing: RouterStore;
}> {
  @observable activateKey: string;
  @observable login: string;

  constructor(props: Readonly<{ routing: RouterStore }>) {
    super(props);

    const queryStrings = QueryString.parse(props.routing.location.search);
    if (queryStrings.key) {
      this.activateKey = queryStrings.key as string;
    }
    if (queryStrings.login) {
      this.login = queryStrings.login as string;
    }
  }

  readonly activateAccount = remoteData<boolean>({
    invoke: () => {
      if (this.activateKey && this.login) {
        return client.activateAccountUsingGET({
          key: this.activateKey,
          login: this.login,
        });
      } else {
        return Promise.reject('The key or login is empty');
      }
    },
  });

  getSuccessfulMessage = () => {
    return (
      <div>
        <Alert variant={'info'} className={styles.biggerText}>
          <p>
            Thank you for verifying your email address.{' '}
            {this.activateAccount.result && (
              <span>
                You can now <Link to={PAGE_ROUTE.LOGIN}>login</Link> to your{' '}
                {ONCOKB_TM} account.
              </span>
            )}
          </p>

          {!this.activateAccount.result && (
            <p>
              We are reviewing your registration information and will contact
              you about your account&apos;s approval status within two business
              days.
            </p>
          )}
          <MessageToContact
            className={'mb-3'}
            emailTitle={'Account Activation Question'}
          />
          <p>
            <div>Sincerely,</div>
            <div>The {ONCOKB_TM} Team</div>
          </p>
        </Alert>
      </div>
    );
  };

  getFailureMessage = () => {
    // the server attaches more information into the error which the type does not allow
    const error = this.activateAccount.error as any;
    const defaultInfo = 'Your user account could not be activated.';
    return (
      <div>
        <Alert variant={'warning'} className={styles.biggerText}>
          {this.activateAccount.error
            ? error.response &&
              error.response.body &&
              error.response.body.detail
              ? error.response.body.detail
              : `${defaultInfo} due to ${error.message}`
            : defaultInfo}
        </Alert>
      </div>
    );
  };

  render() {
    return (
      <SmallPageContainer>
        {this.activateAccount.isPending ? (
          <LoadingIndicator isLoading={true} />
        ) : null}
        {this.activateAccount.isComplete ? this.getSuccessfulMessage() : null}
        {this.activateAccount.isError ? this.getFailureMessage() : null}
      </SmallPageContainer>
    );
  }
}
