import EnsemblAPI from 'app/shared/api/generated/EnsemblAPI';

const ensemblClient = new EnsemblAPI('https://rest.ensembl.org');

export default ensemblClient;
