const http = require("http");
const fs = require("fs");
const url = require("url");

const hostname = "localhost";
const port = 7777;

function getCSV(file) {
  let file_info = fs.readFileSync(file).toString();
  file_info = file_info.split(/\r?\n/).map((v) => v.split(","));
  return file_info;
}

function getGrades(pupilIndex, subjectIndex) {
  let grades_file = getCSV(`classes/${subjectIndex}.txt`)
  
  grades_file = grades_file.reduce((p, v, i, a) => {
    if (v[0] == pupilIndex) {
      p = p.concat(v.slice(1));
    }
    return p;
  }, []);
  return grades_file;
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
      res.setHeader("Content-Type", "text/html");
      res.end(fs.readFileSync("index.html"));
      break;
    case "/favicon.ico":
      break;
    case "/style.css":
      res.setHeader("Content-Type", "text/css");
      res.end(fs.readFileSync("style.css"));
      break;
    case "/home":
      res.setHeader("Content-Type", "text/html");
      const queryObject = url.parse(req.url, true).query;
      let code = queryObject.code;

      let pupil_file = getCSV("users/pupils.txt");
      let teacher_file = getCSV("users/teachers.txt");
      let meta = getCSV("meta.txt");

      let pupil_index = pupil_file.findIndex((v) => v[0] == code); // TODO: GUIDE FOR USAGE
      let teacher_index = teacher_file.findIndex((v) => v[0] == code);

      if (pupil_index == -1 && teacher_index == -1) {
        res.end(fs.readFileSync("404.html")); // TODO: proper 404.html
      } 
      
      else if (pupil_index !== -1) {
        let response_html = fs.readFileSync("grades.html").toString();
        let string2 = "<tr>";
        let classesGrades = {};
        for (let i = 0; i < meta.length; i++) {
          let grades = getCSV("classes/" + meta[i][0] + ".txt");
          grades = grades.reduce((p, v, i, a) => {
            if (v[0] == pupil_file[pupil_index][0]) {
              p = p.concat(v.slice(1));
            }
            return p;
          }, []);
          console.log(grades);
          classesGrades[meta[i][0]] = [meta[i][1], [...grades]];
          string2 += `
            <td>${meta[i][1]}</td>
            <td>${grades.join(", ")}</td>
          `;
        }
        string2 += "</tr>";
        response_html = response_html.replace(
          "$REPLACE1$",
          pupil_file[pupil_index][1]
        );
        response_html = response_html.replace("$PLACEHOLDER3$", string2);
        res.end(response_html);
      } 
      
      else if (teacher_index !== -1) {
        let response_html = fs.readFileSync("add_grade_start.html").toString();
        response_html = response_html.replace(
          "$PLACEHOLDER1$",
          teacher_file[teacher_index][0]
        );
        response_html = response_html.replace(
          "$PLACEHOLDER4$",
          teacher_file[teacher_index][2]
        );
        let options = `<option id="0">Оберіть учня</option>`;
        for (let i = 0; i < pupil_file.length; i++) {
          options += `<option id="${pupil_file[i][0]}">${pupil_file[i][1]}</option>`;
        }
        response_html = response_html.replace("$PLACEHOLDER2$", options);
        
        res.end(response_html);
      } else {
        res.end(fs.readFileSync("404.html"));
      }
      break;
    case "/pupil_marks":
      let body = "";
      
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const pupilsIndex = data.pupils_index;
          const subjectIndex = data.teachers_index;
          let grades = getGrades(pupilsIndex, subjectIndex);
          console.log(grades);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(JSON.stringify(grades)));
        } catch (error) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 400;
          res.end(JSON.stringify({ result: `error` }));
        }
      });
    
      // res.end(`{"response": "afk request"}`);
      break;
    case "/add_grade_end":
      // TODO: update results in 101.txt
      break;
    default:
      res.setHeader("Content-Type", "text/html");
      res.end(fs.readFileSync("404.html"));
      break;
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
