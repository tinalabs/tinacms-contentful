import styled from 'styled-components';
import { useState } from 'react';
import React from 'react';

interface LinkedSelectFieldProps {
  label?: string;
  name: string;
  component: string;
  initDisplay: string;
  getOptions: () => any;
}

interface LinkedFieldInputProps {
  name: string;
  value: any;
  onChange?: any;
}
export interface LinkedFieldProps {
  name: string;
  input: LinkedFieldInputProps;
  field: LinkedSelectFieldProps;
  tinaForm: any;
  disabled?: boolean;
}

export const ContentfulLinkedSelectField: React.FC<LinkedFieldProps> = props => {
  const [allOptions, setOptions] = useState([]);

  return (
    <SelectElement>
      <select
        onChange={props.input.onChange}
        onMouseDown={() => {
          props.field.getOptions().then((entries: any) => {
            setOptions(entries.items);
          });
        }}
      >
        {allOptions.length !== 0 ? (
          allOptions.map(option => toComponent(option, props.input.value))
        ) : props.input.value ? (
          toComponent(props.input.value, props.input.value)
        ) : (
          <></>
        )}
      </select>
    </SelectElement>
  );
};

function toComponent(option: any, selected: any) {
  selected = selected && option.sys.id === selected.sys.id ? 'selected' : '';
  return (
    <option value={JSON.stringify(option)} selected>
      {option.fields.title || option.fields.name}{' '}
      {/* TODO - make this customizable */}
    </option>
  );
}

const SelectElement = styled.div`
  display: block;
  position: relative;
  select {
    display: block;
    font-family: inherit;
    max-width: 100%;
    padding: var(--tina-padding-small);
    border-radius: var(--tina-radius-small);
    background: var(--tina-color-grey-0);
    font-size: var(--tina-font-size-2);
    line-height: 1.35;
    position: relative;
    background-color: var(--tina-color-grey-0);
    transition: all 85ms ease-out;
    border: 1px solid var(--tina-color-grey-2);
    width: 100%;
    margin: 0;
    appearance: none;
    outline: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position: right 0.7em top 50%;
    background-size: 0.65em auto;
  }
`;
