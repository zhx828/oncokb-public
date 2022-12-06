import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import SmallPageContainer from '../SmallPageContainer';
import { AvField, AvForm } from 'availity-reactstrap-validation';
import { action, observable } from 'mobx';
import client from 'app/shared/api/clientInstance';
import { observer } from 'mobx-react';
import { API_CALL_STATUS } from 'app/config/constants';
import autobind from 'autobind-decorator';
import ReCAPTCHA from 'app/shared/recaptcha/recaptcha';

@observer
export class PasswordResetInit extends React.Component<{}> {
  @observable resetStatus: API_CALL_STATUS;
  recaptcha = new ReCAPTCHA();

  @autobind
  @action
  async resetPassword(event: any, values: any) {
    const token: string = await this.recaptcha.getToken();
    if (values.email) {
      client
        .requestPasswordResetUsingPOST({
          mail: values.email,
          recaptchaToken: token,
        })
        .then(() => {
          this.resetStatus = API_CALL_STATUS.SUCCESSFUL;
        })
        .catch(() => {
          this.resetStatus = API_CALL_STATUS.FAILURE;
        });
    } else {
      this.resetStatus = API_CALL_STATUS.FAILURE;
    }
    // window.grecaptcha.enterprise.reset();
  }

  render() {
    return (
      <SmallPageContainer>
        <h1>Reset your password</h1>
        <Alert variant={'warning'}>
          <span>Enter the email address you used to register</span>
        </Alert>
        {this.resetStatus === API_CALL_STATUS.SUCCESSFUL ? (
          <Alert variant="success">
            Check your email for details on how to reset your password.
          </Alert>
        ) : null}
        {this.resetStatus === API_CALL_STATUS.FAILURE ? (
          <Alert variant="danger">
            <strong>Email address isn&apos;t registered!</strong> Please check
            and try again
          </Alert>
        ) : null}
        <AvForm onValidSubmit={this.resetPassword}>
          <AvField
            name="email"
            label="Email"
            placeholder={'Your email'}
            type="email"
            validate={{
              required: {
                value: true,
                errorMessage: 'Your email is required.',
              },
              minLength: {
                value: 5,
                errorMessage:
                  'Your email is required to be at least 5 characters.',
              },
              maxLength: {
                value: 254,
                errorMessage: 'Your email cannot be longer than 50 characters.',
              },
            }}
          />
          <Button color="primary" type="submit">
            Reset password
          </Button>
        </AvForm>
      </SmallPageContainer>
    );
  }
}
