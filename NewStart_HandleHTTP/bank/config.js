/* ``````````` ## Development By el8rbawY ## ```````````*/
const bankData = {
   loanRatio: 30,
   priceDivision: 2,
   tax: 25,
   dates: {
      oneWeek: 604800000,
      twoWeeks: 1209600000,
      threeWeeks: 1814400000,
      fourWeeks: 2419200000
   }
}

// ---
function getLoanEnd(price) {
   let end = new Date().getTime();

   if (price <= 100000) end += bankData.dates.oneWeek;
   else if (price <= 500000) end += bankData.dates.twoWeeks;
   else end += bankData.dates.threeWeeks;

   return new Date(end);
}