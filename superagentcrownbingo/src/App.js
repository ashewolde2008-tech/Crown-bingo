import * as React from 'react';
import {
    HashRouter,
    Routes,
    Route
} from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import History from './Components/History'; // Import other page components as needed
import UserDetails from './Components/fragments/userDetails';
import LoginPage from './Components/login';
import {
    ToastContainer,
    toast
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Settings from './Components/settings';

function App() {
    return ( <
        HashRouter >
        <
        Routes >
        <
        Route path = "/"
        element = { < LoginPage / >
        }
        /> <
        Route path = "/Dashboard"
        element = { < Dashboard / >
        }
        /> <
        Route path = "/History"
        element = { < History / >
        }
        /> <
        Route path = "/Settings"
        element = { < Settings / >
        }
        />

        <
        Route path = "/User-Details/:uid/:name"
        element = { < UserDetails / >
        }
        /> <
        /Routes> <
        ToastContainer / >
        <
        /HashRouter>
    );
}

export default App;