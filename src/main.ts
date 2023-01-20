import express, {
  Express,
  Request,
  Response
} from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.use(bodyParser.urlencoded({
  limit: "5000mb",
  extended: true,
  parameterLimit: 5000000
}));
app.use(express.json());

app.post('/beta', (req: Request, res: Response) => {
  let {
    formule
  } = req.body
  formule = formule.replaceAll(' ', '')
  let terms_math: Array < string > = ["(", ")", "*", "/", "+", "-"]
  let terms_match: Array < string > = []
  let result: any = {}
  let formule_temp = formule
  let extract_section = ""

  for (let term in terms_math) {
   while(formule_temp.indexOf(terms_math[term]) > -1){
    let index: Number = formule_temp.indexOf(terms_math[term]);
    console.log(formule_temp, index ," set")
    index > -1 ? result = order_terms(index) : null
    }
  }

  return res.send({
    result
  })
  //confirm char is number
  function isNumber(n:any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  //flip left operator select
  function flipText(text:string) {
    return text.split('').reverse().join('');
  }

  //remove text from text main
  function removeText(text:string, remove:string) {
    var index = text.indexOf(remove);
    if (index !== -1) {
      return text.substring(0, index) + text.substring(index + remove.length);
    }
    return text;
  }

  //order expresions
  function order_terms(index: any) {
    let index_temp_before:number = index - 1
    let index_temp_after:number = index + 1
    terms_match.push(formule_temp[index])
    let number_before_term:string = ""
    let number_after_term:string = ""
    let condition_break:boolean = true


    while(index_temp_before >= 0 && (isNumber(formule_temp[index_temp_before]) || formule_temp[index_temp_before] === ".") && condition_break){
      number_before_term += formule_temp[index_temp_before]
      index_temp_before === 0 ? condition_break = false : condition_break = true
      --index_temp_before
    }

    condition_break = true
    number_before_term =  flipText(number_before_term)

    while(index_temp_after >= 0 && (isNumber(formule_temp[index_temp_after]) || formule_temp[index_temp_after] === ".") && condition_break){
      number_after_term += formule_temp[index_temp_after]
      index_temp_after === formule_temp.length ? condition_break = false : condition_break = true
      ++index_temp_after
    }
    
    result = exect_formule(formule_temp[index], number_before_term, number_after_term)
    
    return {
      result
    }
  }

  //result from expresion
  function exect_formule(term:string, first_number: string | number, second_number: string | number) {
    first_number = Number(first_number);
    second_number = Number(second_number);
    let result_operation: number = 0;
    
    switch (term) {
      case "*":
        result_operation = first_number * second_number
        extract_section = first_number + "*" + second_number
        break;
      case "/":
        result_operation = first_number / second_number
        extract_section = first_number + "/" + second_number
        break;
      case "+":
        result_operation = first_number + second_number
        extract_section = first_number + "+" + second_number
        break;
      case "-":
        result_operation = first_number - second_number
        extract_section = first_number + "-" + second_number
        break;
      default:
        result_operation = first_number + second_number
        extract_section = first_number + "+" + second_number
    }

    formule_temp = result_operation + removeText(formule_temp, extract_section) 
    return result_operation;
  }
});

//main function
app.post('/', (req: Request, res: Response)=>{
  let text:string = req.body.formule;
  let result:string = eval(text)
  return res.send({result})
})


//listen port and init server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});