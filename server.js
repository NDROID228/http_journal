const http = require("http");
const fs = require("fs");
const url = require("url");

const hostname = "localhost";
const port = 7777;

function isCodeEqual(file) {
  let file_info = fs.readFileSync(file).toString();
  file_info = file_info.split("\n").map(v => v.split(","));
  return file_info;
}


const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  let URL = req.url;
  let URL_header = URL.match(/^[^?]+/);
  URL_header = URL_header[0];
  console.log(URL_header);
  console.log(`request: ${URL}`);
  switch (URL_header) {
    case "/":
      res.end(fs.readFileSync("index.html"));
      break;
    case "/favicon.ico":
      break;
    case "/home":
      const queryObject = url.parse(req.url, true).query;
      let code = queryObject.code;


      let pupil_file = isCodeEqual("pupils.txt");
      let teacher_file = isCodeEqual("teachers.txt");
     
      let pupil_index = pupil_file.findIndex(v=>v[0]==code); // TODO: GUIDE FOR USAGE
      let teacher_index = teacher_file.findIndex(v=>v[0]==code);
      console.log(pupil_index);
      console.log(teacher_index);
      if (pupil_index == -1 && teacher_index == -1) {
        res.end(fs.readFileSync("404.html")); // TODO: proper 404.html
      }
      else if (pupil_index !== -1) {
        let response_html = fs.readFileSync("grades.html").toString();
        console.log(pupil_file);
        response_html = response_html.replace("$REPLACE1$", pupil_file[pupil_index][1]);
        res.end(response_html);
      } else if(teacher_index !== -1) {
        let response_html = fs.readFileSync("add_grade_start.html").toString();
        response_html.replace("$PLACEHOLDER1$",teacher_file[teacher_index][1]);
        let options = "";
        for(let i = 0; i < pupil_file.length; i++) {
          options += `<select>${pupil_file[i][1]}</select>`;
        }
        response_html.replace("$PLACEHOLDER2$",teacher_file[teacher_index][2]);
        res.end(response_html);
      } else {
         res.end(fs.readFileSync("404.html"));
      }
      break;
    default:
      res.end(fs.readFileSync("404.html"));
      break;
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
