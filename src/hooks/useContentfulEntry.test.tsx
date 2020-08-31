import React from 'react';
import { act, renderHook } from '@testing-library/react-hooks';
import { TinaCMS, TinaProvider } from 'tinacms';
import { ContentfulClient } from '../apis/contentful';
import { TinaContentfulProvider } from '../providers/TinacmsContentfulProvider';
import { useContentfulEntry } from './useContentfulEntry';
import { useContentfulPreview } from './useContentfulPreview';
import { Asset, ContentfulClientApi, Entry } from 'contentful';
// import '@testing-library/jest-dom/extend-expect';
// import { mocked } from 'ts-jest';

// this needs to be cleaned up
const testFuncEntry = () => {
  const returnValue: Entry<any> = {
    update: () => {
      return Promise.resolve({} as Entry<any>);
    },
    toPlainObject: () => {
      return {};
    },
    sys: {
      type: '',
      updatedAt: 'asfd',
      id: 'asdf',
      contentType: {
        sys: {
          id: 'asdf',
          linkType: 'ContentType',
          type: 'Link',
        },
      },
      createdAt: 'asdf',
      locale: 'asdf',
    },
    fields: {
      file: {
        contentType: '',
        details: {
          size: 1,
        },
        fileName: 'asfd',
        url: 'asdf',
      },
      description: 'asdf',
      title: 'asdf',
    },
  };
  return Promise.resolve(returnValue);
};
const testFuncAsset = (id: string, query: string) => {
  console.log(id);
  console.log(query);
  const returnValue: Asset = {
    toPlainObject: () => {
      return {};
    },
    sys: {
      type: '',
      updatedAt: 'asfd',
      id: 'asdf',
      contentType: {
        sys: {
          id: 'asdf',
          linkType: 'ContentType',
          type: 'Link',
        },
      },
      createdAt: 'asdf',
      locale: 'asdf',
    },
    fields: {
      file: {
        contentType: '',
        details: {
          size: 1,
        },
        fileName: 'asfd',
        url: 'asdf',
      },
      description: 'asdf',
      title: 'asdf',
    },
  };
  return Promise.resolve(returnValue);
};
jest.mock('./useContentfulPreview');
// @ts-ignore
const mockContentfulClientApi: ContentfulClientApi = {
  getEntry: testFuncEntry,
  getAsset: testFuncAsset,
};
// @ts-ignore
useContentfulPreview.mockImplementation(() => mockContentfulClientApi);

const FAKE_SPACE_ID = 'asdf';
const FAKE_ENRTY_ID = 'asdf';
const wrapper: React.FC = ({ children }) => {
  const cms = new TinaCMS({
    enabled: false,
    apis: {
      contentful: new ContentfulClient({
        accessTokens: {
          delivery: 'asdf',
          preview: 'asdf',
        },
        clientId: 'asdf',
        defaultEnvironmentId: 'master',
        redirectUrl: 'asdf',
        spaceId: '1234',
      }),
    },
  });
  return (
    <TinaProvider cms={cms}>
      <TinaContentfulProvider
        editing={{
          enabled: false,
        }}
      >
        {children}
      </TinaContentfulProvider>
    </TinaProvider>
  );
};

describe('`useContentfulEntry` hook', () => {
  it('initially returns  an undefined entry and loading true', () => {
    const { result } = renderHook(
      () => useContentfulEntry(FAKE_SPACE_ID, FAKE_ENRTY_ID, { preview: true }),
      {
        wrapper,
      }
    );
    act(() => {
      const [dataBefore, loadingBefore, errorBefore] = result.current;
      // initially the data in undefined and loading is true
      expect(dataBefore).not.toBeDefined();
      expect(loadingBefore).toBeTruthy();
      expect(errorBefore).toBeUndefined();
      expect(useContentfulPreview).toBeCalledTimes(2);
    });
  });
  describe('when preview is true', () => {
    it('after waiting for update it returns an entry, loading false and no error', () => {
      const { result, waitForNextUpdate } = renderHook(
        () =>
          useContentfulEntry(FAKE_SPACE_ID, FAKE_ENRTY_ID, { preview: true }),
        {
          wrapper,
        }
      );
      act(async () => {
        const [dataBefore, loadingBefore, errorBefore] = result.current;
        // initially the data in undefined and loading is true
        expect(dataBefore).not.toBeDefined();
        expect(loadingBefore).toBeTruthy();
        expect(errorBefore).toBeUndefined();

        // wait for network call
        await waitForNextUpdate();
        // data is defined and loading is false
        const [dataNext, loadingNext, errNext] = result.current;
        expect(dataNext).toBeDefined();
        expect(loadingNext).toBeFalsy();
        expect(errNext).toBeUndefined();
      });
    });
  });
});
