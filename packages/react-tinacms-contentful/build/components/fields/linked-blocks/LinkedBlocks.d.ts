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
import { AnyField, Field, Form } from '@tinacms/forms';
export interface BlocksFieldDefinititon extends Field<AnyField> {
    component: 'linked-blocks';
    templates: {
        [key: string]: BlockTemplate;
    };
    getTemplateId: (_block: any) => string;
}
export interface BlockTemplate {
    type: string;
    label: string;
    defaultItem?: object | (() => object);
    key: string;
    fields: Field[];
    /**
     * An optional function which generates `props` for
     * this items's `li`.
     */
    itemProps?: (item: object) => {
        /**
         * The `key` property used to optimize the rendering of lists.
         *
         * If rendering is causing problems, use `defaultItem` to
         * generate a unique key for the item.
         *
         * Reference:
         * * https://reactjs.org/docs/lists-and-keys.html
         */
        key?: string;
        /**
         * The label to be display on the list item.
         */
        label?: string;
    };
}
interface BlockFieldProps {
    input: any;
    meta: any;
    field: BlocksFieldDefinititon;
    form: any;
    tinaForm: Form;
}
export declare const BlocksFieldPlugin: {
    name: string;
    Component: ({ tinaForm, form, field, input }: BlockFieldProps) => JSX.Element;
};
export {};
