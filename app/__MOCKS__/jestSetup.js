import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

jest.doMock('expo-constants', () => 'expo-constants');
jest.doMock('expo', () => ({
    Constants: {
        statusBarHeight: 100
    },
    Location: {
        getCurrentPositionAsync: jest.fn()
    },
    Permissions: {
        askAsync: jest.fn()
    },
    SQLite: {
        openDatabase: () => {
            return {
                transaction: jest.fn()
            }
        }
    },
    Font: {
        loadAsync: jest.fn()
    }
}));