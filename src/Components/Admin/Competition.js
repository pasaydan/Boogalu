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
import { saveCompetition } from "../../Services/Competition";
import { uploadImage } from "../../Services/UploadImage";
const data = {
    name: 'Free Style',
    // img: boogaluLogo,
    startAt: "2017-05-24T10:30",
    endAt: "2017-05-24T10:30",
    fee: 250,
    desc: "Lessons for all users from our expert faculty members. From Hip-Hop to Bharatnatyam. You'll get all learning videos at one place.",
    priceDesc: ["First prize 6000 worth shoes", "Second prize 3000 worth shoes", "Third prize 1500 worth shoes"],
    active: true,
    type: 'running'
}

export default function Competition() {
    const initialCompetitionData = {
        name: "",
        type: "",
        desc: "",
        active: true,
        fee: "",
        img: "",
        startAt: "",
        endAt: "",
        prices: [],
    }
    const [CompetitionData, setCompetitionData] = useState(initialCompetitionData);

    const handleChange = (prop, index) => (event) => {
        let value = event.target.value;
        if (prop === 'active') value = event.target.checked;
        if (prop === 'prices') {
            CompetitionData.prices[index] = event.target.value;
            value = CompetitionData.prices;
        }
        setCompetitionData({ ...CompetitionData, [prop]: value });
    };

    const onimageUpload = (picture) => {
        setCompetitionData({ ...CompetitionData, img: picture });
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    async function saveDetails(e) {
        console.log(await toBase64(CompetitionData.img[0]));
        console.log(CompetitionData)
        // upload competition image to bucket
        let uploadUrl = await toBase64(CompetitionData.img[0]);
        uploadImage(uploadUrl, 'competition', 'small').subscribe((downloadableUrl) => {
            CompetitionData.img = downloadableUrl;
            // save competition data to db with imag url
            saveCompetition(CompetitionData).subscribe((response) => {
                console.log('competition success', response);
                setCompetitionData(initialCompetitionData);
            })
        })
    }
    return (
        <div className="competition-wrap">
            <div className="input-wrap">
                <TextField className="input-field"
                    required
                    id="outlined-required-name"
                    label="Name"
                    onChange={handleChange('name')}
                    value={CompetitionData.name}
                    variant="outlined"
                />
            </div>
            <div className="input-wrap">
                <TextField className="input-field"
                    required
                    id="outlined-required-desc"
                    label="Description"
                    onChange={handleChange('desc')}
                    value={CompetitionData.desc}
                    variant="outlined"
                />
            </div>
            <div className="input-wrap">
                <TextField className="input-field"
                    required
                    id="outlined-required-fee"
                    label="Fee"
                    type="number"
                    onChange={handleChange('fee')}
                    value={CompetitionData.fee}
                    variant="outlined"
                />
            </div>
            <div className="input-wrap">
                <FormControl variant="outlined" className="input-field">
                    <InputLabel id="select-outlined-label">Type</InputLabel>
                    <Select
                        labelId="select-outlined-label"
                        id="select-outlined"
                        value={CompetitionData.type}
                        onChange={handleChange('type')}
                        label="Type"
                    >
                        <MenuItem value="running">Currently Running</MenuItem>
                        <MenuItem value="upcomming">Up-Comming</MenuItem>
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
                            checked={CompetitionData.active}
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
                    value={CompetitionData.startAt}
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
                    value={CompetitionData.endAt}
                    onChange={handleChange('endAt')}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </div>
            <div className="input-wrap">
                <TextField className="input-field"
                    required
                    id="outlined-required-name"
                    label="First Price"
                    onChange={handleChange('prices', 0)}
                    value={CompetitionData.prices[0]}
                    variant="outlined"
                />
            </div>
            <div className="input-wrap">
                <TextField className="input-field"
                    required
                    id="outlined-required-name"
                    label="Second Price"
                    onChange={handleChange('prices', 1)}
                    value={CompetitionData.prices[1]}
                    variant="outlined"
                />
            </div>
            <div className="input-wrap">
                <TextField className="input-field"
                    required
                    id="outlined-required-name"
                    label="Third Price"
                    onChange={handleChange('prices', 2)}
                    value={CompetitionData.prices[2]}
                    variant="outlined"
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
                    label="Select competition image"
                />
            </div>
            <Button variant="contained" color="primary">Cancel</Button>
            <Button variant="contained" color="secondary" onClick={(e) => saveDetails(e)}>Save</Button>
        </div>
    )
}
