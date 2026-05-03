import { useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  TextField,
  Typography,
  Button,
  Grid,
  MenuItem,
  Box,
  Alert
} from "@mui/material";

import { API_URL } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";

const CreateAssignment = () => {

  const { user, token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    complexity: 3,
    approach: ""
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async () => {

    setError("");
    setSuccess("");

    if (!form.title || !form.description || !form.dueDate) {
      setError("Title, description and due date are required");
      return;
    }

    try {

      const data = new FormData();

      data.append("title", form.title);
      data.append("description", form.description);
      data.append("dueDate", form.dueDate);
      data.append("complexity", form.complexity);
      data.append("approach", form.approach);
      data.append("projectType", "assignment");

      if (pdfFile) {
        data.append("pdf", pdfFile);
      }

      // required for your backend validation
      data.append(
        "members",
        JSON.stringify([
          {
            userId: user.id || user._id,
            email: user.email,
            componentName: "Full Assignment"
          }
        ])
      );

      data.append(
        "memberIds",
        JSON.stringify([user.id || user._id])
      );

      const res = await axios.post(
        `${API_URL}/api/projects`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setSuccess("Assignment created successfully");

      console.log(res.data);

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to create assignment"
      );
    }
  };

  return (

    <Container maxWidth="md" sx={{ mt: 5 }}>

      <Paper sx={{ p: 4, borderRadius: 4 }}>

        <Typography
          variant="h5"
          fontWeight="800"
          sx={{ mb: 3 }}
        >
          Create Individual Assignment
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Assignment Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Assignment Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="date"
              name="dueDate"
              label="Due Date"
              InputLabelProps={{ shrink: true }}
              value={form.dueDate}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              name="complexity"
              label="Difficulty"
              value={form.complexity}
              onChange={handleChange}
            >
              <MenuItem value={1}>Easy</MenuItem>
              <MenuItem value={3}>Medium</MenuItem>
              <MenuItem value={5}>Hard</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Approach / Notes (optional)"
              name="approach"
              value={form.approach}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Upload Assignment PDF (optional)
            </Typography>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={handleSubmit}
              >
                Create Assignment
              </Button>
            </Box>
          </Grid>

        </Grid>

      </Paper>

    </Container>
  );
};

export default CreateAssignment;