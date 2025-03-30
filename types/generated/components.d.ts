import type { Schema, Struct } from '@strapi/strapi';

export interface XdataHashtag extends Struct.ComponentSchema {
  collectionName: 'components_xdata_hashtags';
  info: {
    displayName: 'Hashtag';
  };
  attributes: {
    hashtag: Schema.Attribute.String;
  };
}

export interface XdataMentions extends Struct.ComponentSchema {
  collectionName: 'components_xdata_mentions';
  info: {
    description: '';
    displayName: 'Mentions';
  };
  attributes: {
    handle: Schema.Attribute.String;
  };
}

export interface XdataParticipants extends Struct.ComponentSchema {
  collectionName: 'components_xdata_participants';
  info: {
    displayName: 'Participants';
  };
  attributes: {
    Participant: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'xdata.hashtag': XdataHashtag;
      'xdata.mentions': XdataMentions;
      'xdata.participants': XdataParticipants;
    }
  }
}
