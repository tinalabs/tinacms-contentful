/**

Copyright 2019 Forestry.io Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

import * as React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
  ModalPopup,
} from '@tinacms/react-modals';
import { FormBuilder, FieldsBuilder } from '@tinacms/form-builder';
import { useMemo } from 'react';
import { Form } from '@tinacms/forms';
import { Button } from '@tinacms/styles';
import { useCMS } from '@tinacms/react-core';
import { mapLocalizedValues } from '../../../utils/mapLocalizedValues';

export const LinkBlockModal = ({ onSubmit, close, models }: any) => {
  const cms = useCMS();

  let form: Form;

  const getOptions = async () => {
    const model = form.values['content-model'] || models[0];
    return cms.api.contentful.fetchEntries(model);
  };

  form = useMemo(
    () =>
      new Form({
        label: 'link-form',
        id: 'link-form-id',
        actions: [],
        fields: [
          {
            name: 'content-model',
            component: 'select',
            label: 'Block type',
            description: 'What type of block would you like to add?',
            options: models,
          },
          {
            name: 'selected',
            label: 'Block',
            component: 'contentful-linked-field',
            parse: value => JSON.parse(value),
            getOptions,
          },
        ],
        onSubmit(values) {
          const localizedResult = {
            sys: values.selected.sys,
            fields: mapLocalizedValues(values.selected.fields, 'en-US'),
          };
          onSubmit(localizedResult, cms);
          close();
        },
      }),
    [close, cms, onSubmit]
  );
  return (
    <Modal>
      <FormBuilder form={form}>
        {({ handleSubmit }) => {
          return (
            <ModalPopup>
              <ModalHeader close={close}>Link block</ModalHeader>
              <ModalBody
                onKeyPress={e =>
                  e.charCode === 13 ? (handleSubmit() as any) : null
                }
              >
                <FieldsBuilder form={form} fields={form.fields} />
              </ModalBody>
              <ModalActions>
                <Button onClick={close}>Cancel</Button>
                <Button onClick={handleSubmit as any} primary>
                  Add
                </Button>
              </ModalActions>
            </ModalPopup>
          );
        }}
      </FormBuilder>
    </Modal>
  );
};
