import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Button,
} from "@mui/material";

import {
  CheckCircle,
  Cancel,
  ArrowBack,
} from "@mui/icons-material";

import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function MyAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnswers();
  }, []);

  const loadAnswers = async () => {
    try {
      const res = await client.get(`/api/user-answers/${id}/answers`);
      setAnswers(res.data);
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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#F4F7FC",
        p: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: 900,
          mx: "auto",
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 4,
          }}
        >
          Assessment Review
        </Typography>

        {answers.map((q, index) => (
          <Card
            key={q.question_id}
            sx={{
              mb: 4,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Question {index + 1}
                </Typography>

                <Chip
                  icon={
                    q.is_correct ? (
                      <CheckCircle />
                    ) : (
                      <Cancel />
                    )
                  }
                  label={q.is_correct ? "Correct" : "Wrong"}
                  color={q.is_correct ? "success" : "error"}
                />
              </Box>

              <Typography
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  fontSize: 17,
                }}
              >
                {q.question}
              </Typography>

              {[
                { key: "A", text: q.option_a },
                { key: "B", text: q.option_b },
                { key: "C", text: q.option_c },
                { key: "D", text: q.option_d },
              ]
                .filter((option) => option.text)
                .map((option) => {
                  const isSelected =
                    option.key === q.selected_answer;

                  const isCorrect =
                    option.key === q.correct_answer;

                  return (
                    <Box
                      key={option.key}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        borderRadius: 2,
                        border: "1px solid #ddd",
                        background: isCorrect
                          ? "#E8F5E9"
                          : isSelected
                          ? "#FFEBEE"
                          : "#fff",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight:
                            isSelected || isCorrect ? 700 : 500,
                        }}
                      >
                        {option.key}. {option.text}
                      </Typography>

                      {isCorrect && (
                        <Typography
                          sx={{
                            color: "#2E7D32",
                            fontSize: 13,
                            mt: 0.5,
                          }}
                        >
                          ✓ Correct Answer
                        </Typography>
                      )}

                      {isSelected && (
                        <Typography
                          sx={{
                            color: q.is_correct
                              ? "#1565C0"
                              : "#D32F2F",
                            fontSize: 13,
                            mt: 0.5,
                          }}
                        >
                          Your Answer
                        </Typography>
                      )}
                    </Box>
                  );
                })}

              {!q.is_correct && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "error.main",
                    }}
                  >
                    Your Answer :
                  </Typography>

                  <Typography sx={{ mb: 2 }}>
                    {q.selected_text || "Not Answered"}
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "success.main",
                    }}
                  >
                    Correct Answer :
                  </Typography>

                  <Typography>
                    {q.correct_text}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}