import React, { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import TextField from '@material-ui/core/TextField';

const MAX_FIELDS = 6;
const priceArray = [
    {
        key: 'item-1',
        name: null,
        value: null,
    },
    {
        key: 'item-2',
        name: null,
        value: null,
    },
    {
        key: 'item-3',
        name: null,
        value: null,
    }
];

export default function AddMoreInputGroup(props) {
    const [maxFeildCount, setMaxFiledCount] = useState(3);
    const [isFourthInputBoxTrue, toggleFourthInputBox] = useState(false);
    const [isFifthInputBoxTrue, toggleFifthInputBox] = useState(false);
    const [isSixthInputBoxTrue, toggleSixthInputBox] = useState(false);

    const handleChange = (event, type, item) => {
        switch(item) {
            case 'item-1':  setPriceObject(type, item, event.target.value);
                            break;

            case 'item-2':  setPriceObject(type, item, event.target.value);
                            break;

            case 'item-3':  setPriceObject(type, item, event.target.value);
                            break;

            case 'item-4':  setPriceObject(type, item, event.target.value);
                            break;

            case 'item-5':  setPriceObject(type, item, event.target.value);
                            break;

            case 'item-6':  setPriceObject(type, item, event.target.value);
                            break;

            default: break;
        }
    };

    function setPriceObject(type, item, value) {
        if (priceArray.length) {
            priceArray.forEach(ele => {
                if (ele.key === item) {
                    if (type === 'name') {
                        ele.name = value;
                    } else {
                        ele.value = value;
                    }
                }
            });
        }
        
        if (priceArray.length === maxFeildCount) {
            props.setPriceData(priceArray);
        }
    }

    function removeExtraInputBox(event, removeItem) {
        event.stopPropagation();
        let incrementValue = maxFeildCount;
        incrementValue--;
        let removeIndex = '';
        switch(removeItem) {
            case 4: toggleFourthInputBox(false);
                    removeIndex = priceArray.map(function(item) { return item.key; }).indexOf('item-4');
                    priceArray.splice(removeIndex, 1);
                    break;
            case 5: toggleFifthInputBox(false);
                    removeIndex = priceArray.map(function(item) { return item.key; }).indexOf('item-5');
                    priceArray.splice(removeIndex, 1);
                    break;
            case 6: toggleSixthInputBox(false);
                    removeIndex = priceArray.map(function(item) { return item.key; }).indexOf('item-6');
                    priceArray.splice(removeIndex, 1);
                    break;

            default: break;
        }
        setMaxFiledCount(incrementValue);
    }

    function addNewFiledBox(event) {
        event.stopPropagation();
        let incrementValue = maxFeildCount;
        incrementValue++;
        let arrayObj = {};
        switch(incrementValue) {
            case 4: toggleFourthInputBox(true);
                    arrayObj = {
                        key: 'item-4',
                        name: null,
                        value: null
                    }
                    priceArray.push(arrayObj);
                    break;
            case 5: toggleFifthInputBox(true);
                    arrayObj = {
                        key: 'item-5',
                        name: null,
                        value: null
                    }
                    priceArray.push(arrayObj);
                    break;
            case 6: toggleSixthInputBox(true);
                    arrayObj = {
                        key: 'item-6',
                        name: null,
                        value: null
                    }
                    priceArray.push(arrayObj);
                    break;

            default: break;
        }
        setMaxFiledCount(incrementValue);
    }

    return (
        <div className="inputGroupWrap">
            <div className="innerControlGroup">
                <div className="controlGroup" id="control-0">
                    <label className="controlLabel">Price item 1</label>
                    <div className="controls">
                        <TextField 
                            className="input-field"
                            required
                            id="price-name-1"
                            label="Price name"
                            onBlur={(e) => handleChange(e, 'name', 'item-1')}
                            variant="outlined"
                        />
                        <TextField 
                            className="input-field"
                            required
                            id="price-value-1"
                            label="Price value"
                            onBlur={(e) => handleChange(e, 'value', 'item-1')}
                            variant="outlined"
                        />
                    </div>
                </div>
                <div className="controlGroup" id="control-1">
                    <label className="controlLabel">Price item 2</label>
                    <div className="controls">
                        <TextField 
                            className="input-field"
                            required
                            id="price-name-2"
                            label="Price name"
                            onBlur={(e) => handleChange(e, 'name', 'item-2')}
                            variant="outlined"
                        />
                        <TextField 
                            className="input-field"
                            required
                            id="price-value-2"
                            label="Price value"
                            onBlur={(e) => handleChange(e, 'value', 'item-2')}
                            variant="outlined"
                        />
                    </div>
                </div>
                <div className="controlGroup" id="control-2">
                    <label className="controlLabel">Price item 3</label>
                    <div className="controls">
                        <TextField 
                            className="input-field"
                            required
                            id="price-name-3"
                            label="Price name"
                            onBlur={(e) => handleChange(e, 'name', 'item-3')}
                            variant="outlined"
                        />
                        <TextField 
                            className="input-field"
                            required
                            id="price-value-3"
                            label="Price value"
                            onBlur={(e) => handleChange(e, 'value', 'item-3')}
                            variant="outlined"
                        />
                    </div>
                </div>
                {
                    isFourthInputBoxTrue ?
                    <div className="controlGroup extraControlGroup" id="control-3">
                        <label className="controlLabel">Price item 4</label>
                        <div className="controls">
                            <TextField 
                                className="input-field"
                                required
                                id="price-name-4"
                                label="Price name"
                                onBlur={(e) => handleChange(e, 'name', 'item-4')}
                                variant="outlined"
                            />
                            <TextField 
                                className="input-field"
                                required
                                id="price-value-4"
                                label="Price value"
                                onBlur={(e) => handleChange(e, 'value', 'item-4')}
                                variant="outlined"
                            />
                        </div>
                        <a className="deleteInputBox" title="remove this price item" onClick={(e) => removeExtraInputBox(e, 4)}>
                            <FaTrashAlt />
                        </a>
                    </div>
                    : ''
                }
                {
                    isFifthInputBoxTrue ?
                    <div className="controlGroup extraControlGroup" id="control-4">
                        <label className="controlLabel">Price item 5</label>
                        <div className="controls">
                            <TextField 
                                className="input-field"
                                required
                                id="price-name-5"
                                label="Price name"
                                onBlur={(e) => handleChange(e, 'name', 'item-5')}
                                variant="outlined"
                            />
                            <TextField 
                                className="input-field"
                                required
                                id="price-value-5"
                                label="Price value"
                                onBlur={(e) => handleChange(e, 'value', 'item-5')}
                                variant="outlined"
                            />
                        </div>
                        <a className="deleteInputBox" title="remove this price item" onClick={(e) => removeExtraInputBox(e, 5)}>
                            <FaTrashAlt />
                        </a>
                    </div>
                    : ''    
                }
                {
                    isSixthInputBoxTrue ?
                    <div className="controlGroup extraControlGroup" id="control-5">
                        <label className="controlLabel">Price item 6</label>
                        <div className="controls">
                            <TextField 
                                className="input-field"
                                required
                                id="price-name-6"
                                label="Price name"
                                onBlur={(e) => handleChange(e, 'name', 'item-6')}
                                variant="outlined"
                            />
                            <TextField 
                                className="input-field"
                                required
                                id="price-value-6"
                                label="Price value"
                                onBlur={(e) => handleChange(e, 'value', 'item-6')}
                                variant="outlined"
                            />
                        </div>
                        <a className="deleteInputBox" title="remove this price item" onClick={(e) => removeExtraInputBox(e, 6)}>
                            <FaTrashAlt />
                        </a>
                    </div>
                    : ''                
                }
            </div>
            {
                maxFeildCount < MAX_FIELDS ?
                <a className="addMoreLink" onClick={(e) => addNewFiledBox(e)}>Add more +</a> : ''
            }
        </div>
    )
}