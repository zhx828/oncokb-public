import { observable } from 'mobx';
import { remoteData } from 'cbioportal-frontend-commons';
import ensemblClient from 'app/shared/api/ensemblClientInstance';
import { VariantRecorderResponse } from 'app/shared/api/generated/EnsemblAPI';

export class EnsemblStore {
  @observable variantRecorderId: string;

  readonly ensembleVRData = remoteData<VariantRecorderResponse[]>({
    invoke: () => {
      console.log(this.variantRecorderId);
      return ensemblClient.variantRecorderUsingGET({
        id: this.variantRecorderId,
        $domain: 'https://rest.ensembl.org'
      });
    }
  });
}
