import React, { useState, Fragment } from 'react';
import pDelay from 'delay';
import { TextField, Button, CircularProgress } from '@material-ui/core';
import { usePromiseState } from 'react-promiseful';
import './App.css';

const App = () => {
    const [thresholdMs, setThresholdMs] = useState(300);
    const [saveDuration, setSaveDuration] = useState(300);

    const [promise, setPromise] = useState();
    const promiseState = usePromiseState(promise, { thresholdMs });

    const saveDisabled = promiseState.status === 'pending';
    const handleThresholdMsChange = (event) => setThresholdMs(Number(event.target.value) || 0);
    const handleSaveDurationChange = (event) => setSaveDuration(Number(event.target.value) || 0);
    const handleSave = () => setPromise(pDelay(saveDuration));
    const handleSubmit = (e) => e.preventDefault();

    console.log('promiseState', promiseState);

    return (
        <section>
            <h1><code>react-promiseful</code> demo</h1>

            <p>
                Hitting the save button below will simulate an async operation that lasts for <code>{ saveDuration }ms</code>.<br />
                { thresholdMs >= saveDuration && <Fragment>You will <strong>not see</strong> a spinner because the <code>thresholdMs</code> is higher or equal than the async operation duration.</Fragment> }
                { thresholdMs < saveDuration && <Fragment>You will <strong>see</strong> a spinner because the <code>thresholdMs</code> is lower than the async operation duration.</Fragment> }
            </p>

            <form onSubmit={ handleSubmit }>
                <TextField
                    className="App__durationInput"
                    id="saveDuration"
                    label="Save duration (ms)"
                    value={ saveDuration }
                    onChange={ handleSaveDurationChange }
                    margin="normal" />

                <TextField
                    id="thresholdMs"
                    label="thresholdMs"
                    value={ thresholdMs }
                    onChange={ handleThresholdMsChange }
                    margin="normal" />

                <div className="App__bottom">
                    <Button
                        className="App__saveButton"
                        variant="contained"
                        color="primary"
                        disabled={ saveDisabled }
                        onClick={ handleSave }>
                        Save
                    </Button>

                    <span>
                        { promiseState.status === 'pending' && !promiseState.withinThreshold && <CircularProgress /> }
                        { promiseState.status === 'fulfilled' && 'Saved!' }
                        { promiseState.status === 'rejected' && 'Oops, failed to save' }
                    </span>
                </div>
            </form>
        </section>
    );
};

export default App;
