import React from 'react';
import { shallow } from 'enzyme';
import AccueilComponent from '../accueil.component';

describe('Testing ReassignLocationMenu component', () => {
    it('renders as expected', () => {
        const wrapper = shallow(<AccueilComponent />)
        expect(wrapper).toBeTruthy()
        // expect(true).toBeTruthy();
    });
});