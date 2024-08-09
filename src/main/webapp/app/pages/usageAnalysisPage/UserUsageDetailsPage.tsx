import { UserUsage } from 'app/shared/api/generated/API';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import React from 'react';
import { Link, match } from 'react-router-dom';
import client from 'app/shared/api/clientInstance';
import { getSectionClassName } from '../account/AccountUtils';
import { Col, Row } from 'react-bootstrap';
import UserUsageDetailsTable from './UserUsageDetailsTable';
import { InfoRow } from '../AccountPage';
import {
  USAGE_DETAIL_TIME_KEY,
  USAGE_ALL_TIME_KEY,
  USAGE_ALL_TIME_VALUE,
  USAGE_DAY_DETAIL_TIME_KEY,
} from 'app/config/constants';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import {
  ToggleValue,
  UsageRecord,
} from 'app/pages/usageAnalysisPage/UsageAnalysisPage';
import { notifyError } from 'app/shared/utils/NotificationUtils';

@inject('routing')
@observer
export default class UserUsageDetailsPage extends React.Component<{
  routing: RouterStore;
  match: match;
}> {
  @observable user: UserUsage;

  userId = this.props.match.params['id'];

  constructor(props: Readonly<{ routing: RouterStore; match: match }>) {
    super(props);
  }

  readonly usageDetail = remoteData<Map<string, UsageRecord[]>>({
    await: () => [],
    invoke: async () => {
      const result = new Map<string, UsageRecord[]>();
      try {
        this.user = await client.userUsageGetUsingGET({ userId: this.userId });
        if (this.user.summary !== null) {
          const yearSummary = this.user.summary.year;
          const yearUsage: UsageRecord[] = [];
          Object.keys(yearSummary).forEach(resourceEntry => {
            yearUsage.push({
              resource: resourceEntry,
              usage: yearSummary[resourceEntry],
              time: USAGE_ALL_TIME_VALUE,
            });
          });
          result.set(USAGE_ALL_TIME_KEY, yearUsage);

          const monthSummary = this.user.summary.month;
          const detailSummary: UsageRecord[] = [];
          Object.keys(monthSummary).forEach(month => {
            const monthUsage = monthSummary[month];
            Object.keys(monthUsage).forEach(resourceEntry => {
              detailSummary.push({
                resource: resourceEntry,
                usage: monthUsage[resourceEntry],
                time: month,
              });
            });
          });
          result.set(USAGE_DETAIL_TIME_KEY, detailSummary);

          const daySummary = this.user.summary.day;
          const dayDetailSummary: UsageRecord[] = [];
          Object.keys(daySummary).forEach(day => {
            const dayUsage = daySummary[day];
            Object.keys(dayUsage).forEach(resourceEntry => {
              dayDetailSummary.push({
                resource: resourceEntry,
                usage: dayUsage[resourceEntry],
                time: day,
              });
            });
          });
          result.set(USAGE_DAY_DETAIL_TIME_KEY, dayDetailSummary);
        }
      } catch (error) {
        notifyError(error, 'Failed to load user data usage with error: ');
      }
      return Promise.resolve(result);
    },
    default: new Map(),
  });

  render() {
    return (
      <>
        <Row className={getSectionClassName(true)}>
          <Col>
            <h5>User Usage Information</h5>
            <hr />
            {this.user ? (
              <>
                <InfoRow
                  title="First Name"
                  content={this.user.userFirstName}
                ></InfoRow>
                <InfoRow
                  title="Last Name"
                  content={this.user.userLastName}
                ></InfoRow>
                <InfoRow title="Email">
                  <Link to={`/users/${this.user.userEmail}`}>
                    {this.user.userEmail}
                  </Link>
                </InfoRow>
                <InfoRow title="Company" content={this.user.company}></InfoRow>
                <InfoRow
                  title="Job Title"
                  content={this.user.jobTitle}
                ></InfoRow>
                <InfoRow
                  title="License Type"
                  content={this.user.licenseType}
                ></InfoRow>
              </>
            ) : (
              <span>Not available</span>
            )}
          </Col>
        </Row>

        <UserUsageDetailsTable
          data={this.usageDetail.result}
          loadedData={this.usageDetail.isComplete}
          defaultResourcesType={ToggleValue.PUBLIC_RESOURCES}
          defaultTimeType={ToggleValue.RESULTS_BY_MONTH}
        />
      </>
    );
  }
}
