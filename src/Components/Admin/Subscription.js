import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ImageUploader from 'react-images-upload';
import Button from '@material-ui/core/Button';
import { uploadImage } from "../../Services/Upload.service";
import { saveSubscription } from "../../Services/Subscription.service";

export default function Subscription() {
    const initialSubscriptionData = {
        name: "",
        desc: "",
        active: true,
        type: "",
        amount: "",
        img: "",
        startAt: "",
        endAt: "",
        plans: "",
    }
    const [Subscription, setSubscription] = useState(initialSubscriptionData);

    const handleChange = (prop, index) => (event) => {
        let value = event.target.value;
        if (prop === 'active') value = event.target.checked;
        if (prop === 'prices') {
            Subscription.prices[index] = event.target.value;
            value = Subscription.prices;
        }
        setSubscription({ ...Subscription, [prop]: value });
    };

    const onimageUpload = (picture) => {
        setSubscription({ ...Subscription, img: picture });
    }

    async function saveDetails(e) {
        console.log(Subscription)
        // upload Subscription image to bucket
        if (Subscription.img[0]) {
            const reader = new FileReader();
            reader.readAsDataURL(Subscription.img[0]);
            reader.onload = () => {
                uploadImage(reader.result, 'subscription', 'small').subscribe((downloadableUrl) => {
                    Subscription.img = downloadableUrl;
                    // save Subscription data to db with imag url
                    saveSubscription(Subscription).subscribe((response) => {
                        console.log('Subscription success', response);
                        setSubscription(initialSubscriptionData);
                    })
                })
            }
        } else {
            saveSubscription(Subscription).subscribe((response) => {
                console.log('Subscription success', response);
                setSubscription(initialSubscriptionData);
            })
        }
    }
    return (
        <div className="Subscription-bo-wrap">
            <div className="input-wrap">
                <TextField className="input-field"
                    required
                    id="outlined-required-name"
                    label="Name"
                    onChange={handleChange('name')}
                    value={Subscription.name}
                    variant="outlined"
                />
            </div>
            <div className="input-wrap">
                <TextField className="input-field"
                    id="outlined-required-desc"
                    label="Description"
                    onChange={handleChange('desc')}
                    value={Subscription.desc}
                    variant="outlined"
                />
            </div>
            <div className="input-wrap">
                <TextField className="input-field"
                    id="outlined-required-amount"
                    label="Amount"
                    type="number"
                    onChange={handleChange('amount')}
                    value={Subscription.amount}
                    variant="outlined"
                />
            </div>
            <div className="input-wrap">
                <FormControl variant="outlined" className="input-field">
                    <InputLabel id="select-outlined-label">Plans</InputLabel>
                    <Select
                        labelId="select-outlined-label"
                        id="select-outlined"
                        value={Subscription.plans}
                        onChange={handleChange('plans')}
                    >
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="annual">Annual</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <div className="input-wrap">
                <FormControlLabel
                    control={
                        <Checkbox
                            required
                            color="primary"
                            className="selected-item-checkbox"
                            checked={Subscription.active}
                            onChange={handleChange('active')}
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                        />
                    }
                    label="Active"
                />
            </div>
            <div className="inpyt-wrap">
                <TextField
                    id="datetime-local"
                    label="Start Date & Time"
                    type="datetime-local"
                    value={Subscription.startAt}
                    onChange={handleChange('startAt')}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </div>
            <div className="input-wrap">
                <TextField
                    id="datetime-local"
                    label="End Date & Time"
                    type="datetime-local"
                    value={Subscription.endAt}
                    onChange={handleChange('endAt')}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </div>
            <div className="input-wrap">
                <ImageUploader
                    withIcon={true}
                    buttonText='Upload image'
                    onChange={onimageUpload}
                    imgExtension={['.jpg', '.gif', '.png', '.gif', '.svg']}
                    maxFileSize={5242880}
                    accept="image/*"
                    withPreview={true}
                    singleImage={true}
                    label="Select subscription image"
                />
            </div>
            <Button variant="contained" color="primary">Cancel</Button>
            <Button variant="contained" color="secondary" onClick={(e) => saveDetails(e)}>Save</Button>
        </div>
    )
}
