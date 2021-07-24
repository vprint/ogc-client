import capabilities200 from '../../fixtures/wfs/capabilities-pigma-2-0-0.xml';
import getfeature200 from '../../fixtures/wfs/getfeature-hits-pigma-2-0-0.xml';
import describefeaturetype200 from '../../fixtures/wfs/describefeaturetype-pigma-2-0-0-xsd.xml';
import WfsEndpoint from './endpoint';
import { useCache } from '../shared/cache';

jest.mock('../shared/cache', () => ({
  useCache: jest.fn((factory) => factory()),
}));

describe('WfsEndpoint', () => {
  /** @type {WfsEndpoint} */
  let endpoint;

  beforeEach(() => {
    jest.clearAllMocks();
    window.fetchResponseFactory = (url) => {
      if (url.indexOf('GetCapabilities') > -1) return capabilities200;
      if (url.indexOf('GetFeature') > -1) return getfeature200;
      if (url.indexOf('DescribeFeatureType') > -1)
        return describefeaturetype200;
      return 'error';
    };
    endpoint = new WfsEndpoint(
      'https://my.test.service/ogc/wfs?service=wfs&request=DescribeFeatureType&featureType=myfeatures'
    );
  });

  it('makes a getcapabilities request', async () => {
    await endpoint.isReady();
    expect(window.fetch).toHaveBeenCalledWith(
      'https://my.test.service/ogc/wfs?featureType=myfeatures&SERVICE=WFS&REQUEST=GetCapabilities'
    );
  });

  it('uses cache', () => {
    expect(useCache).toHaveBeenCalledTimes(1);
  });

  describe('#isReady', () => {
    it('resolves with the endpoint object', async () => {
      await expect(endpoint.isReady()).resolves.toEqual(endpoint);
    });
  });

  describe('#getVersion', () => {
    it('returns the correct version', async () => {
      await endpoint.isReady();
      expect(endpoint.getVersion()).toBe('2.0.0');
    });
  });

  describe('#getFeatureTypes', () => {
    it('returns a list of feature types (summary)', async () => {
      await endpoint.isReady();
      expect(endpoint.getFeatureTypes()).toEqual([
        {
          abstract:
            'Registre Parcellaire Graphique 2010 en Aquitaine - Agence de Service et de Paiement',
          boundingBox: [
            -1.9540704007796161,
            42.73286181824404,
            1.496463327812538,
            45.717071228823876,
          ],
          name: 'asp:asp_rpg2010',
          title: 'ASP - RPG 2010',
        },
        {
          abstract:
            'Représentation des moyennes journalières des trafics routiers sur les routes départementales de la\n                Charente (16) au 1er Janvier 2021.\r\n                \r\n                Mise à jour : Mars 2021\n            ',
          boundingBox: [
            -0.4906009184568518,
            45.175543885638376,
            0.9778719979726385,
            46.14349349624617,
          ],
          name: 'cd16:comptages_routiers_l',
          title: 'CD 16 - Comptages routiers',
        },
        {
          abstract:
            'Hiérarchisation du réseau routier départemental en fonction des caractéristiques de chaque section\n                de route et de son usage au 1er Janvier 2021.\r\n                \r\n                Mise à jour : Mars 2021\n            ',
          boundingBox: [
            -0.4832134559131876,
            45.18037755571674,
            0.9725372441782966,
            46.13877580094452,
          ],
          name: 'cd16:hierarchisation_l',
          title: 'CD 16 - Hiérarchisation du réseau',
        },
      ]);
    });
  });

  describe('#getFeatureTypeByName', () => {
    it('uses cache', async () => {
      await endpoint.isReady();
      endpoint.getFeatureTypeByName('cd16:hierarchisation_l');
      expect(useCache).toHaveBeenCalledTimes(2);
    });
    it('returns detailed info on a feature type', async () => {
      await endpoint.isReady();
      await expect(
        endpoint.getFeatureTypeByName('cd16:hierarchisation_l')
      ).resolves.toEqual({
        abstract:
          'Hiérarchisation du réseau routier départemental en fonction des caractéristiques de chaque section\n                de route et de son usage au 1er Janvier 2021.\r\n                \r\n                Mise à jour : Mars 2021\n            ',
        name: 'cd16:hierarchisation_l',
        title: 'CD 16 - Hiérarchisation du réseau',
        boundingBox: [
          -0.4832134559131876,
          45.18037755571674,
          0.9725372441782966,
          46.13877580094452,
        ],
        defaultCrs: 'EPSG:2154',
        otherCrs: ['EPSG:32615', 'EPSG:32616', 'EPSG:32617', 'EPSG:32618'],
        outputFormats: [
          'application/gml+xml; version=3.2',
          'text/xml; subtype=gml/3.2.1',
          'text/xml; subtype=gml/3.1.1',
          'text/xml; subtype=gml/2.1.2',
        ],
        properties: {
          axe: 'string',
          cumuld: 'integer',
          cumulf: 'integer',
          plod: 'string',
          absd: 'integer',
          plof: 'string',
          absf: 'integer',
          categorie: 'integer',
        },
        geometryName: 'geom',
        geometryType: 'linestring',
        objectCount: 364237,
      });
    });
  });

  describe('#getServiceInfo', () => {
    it('returns service info', async () => {
      await endpoint.isReady();
      expect(endpoint.getServiceInfo()).toEqual({
        abstract: "Service WFS de l'IDS régionale PIGMA",
        constraints: 'aucun',
        fees: 'aucun',
        name: 'WFS',
        title: "Service WFS de l'IDS régionale PIGMA",
      });
    });
  });
});
