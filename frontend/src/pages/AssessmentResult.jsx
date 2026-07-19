import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from "@mui/material";

import {
  CheckCircle,
  EmojiEvents,
  Quiz,
  TaskAlt,
  HighlightOff,
} from "@mui/icons-material";

import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function AssessmentResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const response = await client.get(
        `/api/user-assessments/${id}/result`
      );

      setResult(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress size={55} />
      </Box>
    );
  }

  if (!result) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Typography variant="h5">
          Result not found
        </Typography>
      </Box>
    );
  }

  const passed = result.status === "Passed";

  const StatCard = ({ icon, title, value, color }) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        height: "100%",
        border: "1px solid #E5E7EB",
        transition: ".3s",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: 6,
        },
      }}
    >
      <CardContent>

        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            mb: 2,
          }}
        >
          {icon}
        </Box>

        <Typography color="text.secondary">
          {title}
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mt: 1,
          }}
        >
          {value}
        </Typography>

      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#EEF4FF,#F8FAFC)",
        py: 4,
        px: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          maxWidth: 820,
          mx: "auto",
        }}
      >
        {/* Header */}

        <Card
          elevation={6}
          sx={{
            borderRadius: 5,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              background:
                "linear-gradient(90deg,#2563EB,#4F46E5)",
              color: "#fff",
              py: 3,
              px: 3,
              textAlign: "center",
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 60,
                color: "#22C55E",      // Green
                backgroundColor: "#fff",
                borderRadius: "50%",
                p: 0.5,
              }}
            />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mt: 1,
              }}
            >
              Assessment Completed
            </Typography>

            <Typography
              sx={{
                opacity: .9,
                mt: 1,
                fontSize: 18,
              }}
            >
              {result.assessment_title}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 4,
              pt: 6,
            }}
          >
            <Box
              sx={{
                mt: -5,
                position: "relative",
                zIndex: 2,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: "repeat(4,1fr)",
                },
                gap: 3,
              }}
            >
              <StatCard
                title="Score"
                value={`${result.score}%`}
                color="#2563EB"
                icon={<EmojiEvents />}
              />

              <StatCard
                title="Correct Answers"
                value={result.correct_answers}
                color="#16A34A"
                icon={<TaskAlt />}
              />

              <StatCard
                title="Wrong Answers"
                value={result.wrong_answers}
                color="#DC2626"
                icon={<HighlightOff />}
              />

              <StatCard
                title="Total Questions"
                value={result.total_questions}
                color="#F59E0B"
                icon={<Quiz />}
              />
            </Box>

            <Box
              sx={{
                mt: 5,
                textAlign: "center",
              }}
            >
              <Chip
                label={passed ? "PASSED" : "FAILED"}
                color={passed ? "success" : "error"}
                sx={{
                  fontSize: 18,
                  px: 3,
                  py: 3,
                  fontWeight: 700,
                }}
              />

              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  mt: 3,
                }}
              >
                {passed
                  ? "Congratulations! You have successfully completed this assessment."
                  : "Unfortunately you did not achieve the passing score. Keep practicing and try again."}
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 5,
                display: "flex",
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 3,
                  px: 5,
                  textTransform: "none",
                }}
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate(`/assessment-answers/${id}`)}
              >
                View Answers
              </Button>
            </Box>

          </Box>
        </Card>
      </Box>
    </Box>
  );
}