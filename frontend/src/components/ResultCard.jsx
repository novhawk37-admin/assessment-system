import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box
} from "@mui/material";


export default function ResultCard({
  title,
  value,
  color
}) {


  return (

    <Card
      sx={{
        borderRadius:3,
        height:"100%",
        boxShadow:2
      }}
    >

      <CardContent>


        <Box
          sx={{
            width:45,
            height:45,
            borderRadius:"50%",
            background:color,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            mb:2
          }}
        />


        <Typography
          variant="body2"
          color="text.secondary"
        >

          {title}

        </Typography>



        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color:color,
            mt:1
          }}
        >

          {value}

        </Typography>


      </CardContent>

    </Card>

  );

}