export function gql(strings, ...args) {
  let str = "";
  strings.forEach((string, i) => {
    str += string + (args[i] || "");
  });
  return str;
}
export const HomePartsFragmentDoc = gql`
    fragment HomeParts on Home {
  __typename
  seo {
    __typename
    title
    description
    image
  }
  general {
    __typename
    name
    tagline
    phone
    email
    whatsapp
    bookingUrl
    address
    instagram
    checkIn
    checkOut
  }
  buttons {
    __typename
    bookDirect
    checkAvailability
    seeSuites
    explore
  }
  nav {
    __typename
    suites
    facilities
    gallery
    location
    contact
  }
  hero {
    __typename
    eyebrow
    place
    slides {
      __typename
      ... on HomeHeroSlidesPhotoSlide {
        image
        title
        em
        alt
        seconds
      }
      ... on HomeHeroSlidesVideoSlide {
        poster
        posterMobile
        title
        em
        alt
        seconds
        video
        videoMobile
      }
    }
  }
  arrival {
    __typename
    eyebrow
    title
    em
    lede
    ledeEm
    place
  }
  suitesSection {
    __typename
    eyebrow
    title
    em
    lede
    exploreButton
    suites {
      __typename
      name
      long
      guests
      size
      outdoor
      bestFor
      highlights
      photos {
        __typename
        src
        alt
      }
      pending
    }
    outroEyebrow
    outroTitle
    outroEm
    inEverySuite {
      __typename
      label
      icon
    }
  }
  facilitiesSection {
    __typename
    eyebrow
    title
    em
    lede
    groups {
      __typename
      title
      em
      text
      items {
        __typename
        name
        tag
        text
        img
        standIn
      }
    }
  }
  daySection {
    __typename
    eyebrow
    moreLink
    moments {
      __typename
      time
      title
      em
      text
      img
      alt
    }
  }
  locationSection {
    __typename
    eyebrow
    title
    em
    lede
  }
  momentsSection {
    __typename
    eyebrow
    title
    em
    lede
    photos {
      __typename
      src
      cap
      alt
      group
    }
  }
  faqSection {
    __typename
    eyebrow
    title
    em
    lede
    moreLink
    faqs {
      __typename
      q
      answer
      pending
    }
  }
  contactSection {
    __typename
    eyebrow
    title
    em
    lede
    callLabel
    writeLabel
    formEyebrow
    formTitle
    formEm
  }
  footer {
    __typename
    aboutTitle
    aboutText
    followText
    note
  }
}
    `;
export const HomeDocument = gql`
    query home($relativePath: String!) {
  home(relativePath: $relativePath) {
    ... on Document {
      _sys {
        filename
        basename
        hasReferences
        breadcrumbs
        path
        relativePath
        extension
      }
      id
    }
    ...HomeParts
  }
}
    ${HomePartsFragmentDoc}`;
export const HomeConnectionDocument = gql`
    query homeConnection($before: String, $after: String, $first: Float, $last: Float, $sort: String, $filter: HomeFilter) {
  homeConnection(
    before: $before
    after: $after
    first: $first
    last: $last
    sort: $sort
    filter: $filter
  ) {
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
    totalCount
    edges {
      cursor
      node {
        ... on Document {
          _sys {
            filename
            basename
            hasReferences
            breadcrumbs
            path
            relativePath
            extension
          }
          id
        }
        ...HomeParts
      }
    }
  }
}
    ${HomePartsFragmentDoc}`;
export function getSdk(requester) {
  return {
    home(variables, options) {
      return requester(HomeDocument, variables, options);
    },
    homeConnection(variables, options) {
      return requester(HomeConnectionDocument, variables, options);
    }
  };
}
import { createClient } from "tinacms/dist/client";
const generateRequester = (client) => {
  const requester = async (doc, vars, options) => {
    let url = client.apiUrl;
    if (options?.branch) {
      const index = client.apiUrl.lastIndexOf("/");
      url = client.apiUrl.substring(0, index + 1) + options.branch;
    }
    const data = await client.request({
      query: doc,
      variables: vars,
      url
    }, options);
    return { data: data?.data, errors: data?.errors, query: doc, variables: vars || {} };
  };
  return requester;
};
export const ExperimentalGetTinaClient = () => getSdk(
  generateRequester(
    createClient({
      url: "/api/tina/gql",
      queries
    })
  )
);
export const queries = (client) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
