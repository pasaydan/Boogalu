import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import React from "react";

const FollowButton = (props) => {
  const { status } = props;

  const handleChange = (event) => {
    let value = event.target.value;
    console.log("value ", value);
  };

  return (
    <>
      {!status && (
        <Button variant="contained" color="primary" className="follow">
          Follow
        </Button>
      )}
      {status === "following" && (
        <div className="input-wrap">
          <FormControl variant="outlined" className="input-field">
            <InputLabel id="following-label" required>
              Following
            </InputLabel>
            <Select
              required
              labelId="following-label"
              id="following"
              value={""}
              onChange={(e) => handleChange(e)}
              label="Following"
            >
              <MenuItem value="unfollow">Unfollow</MenuItem>
              <MenuItem value="block">Block</MenuItem>
            </Select>
          </FormControl>
        </div>
      )}
      {status === "requested" && (
        <>
          <InputLabel id="requested-label" required>
            Requested
          </InputLabel>
          <Select
            required
            labelId="requested-label"
            id="requested"
            value={""}
            onChange={(e) => handleChange(e)}
            label="Requested"
          >
            <MenuItem value="cancelrequest">Cancel Request</MenuItem>
            <MenuItem value="block">Block</MenuItem>
          </Select>
        </>
      )}
    </>
  );
};

export default FollowButton;
