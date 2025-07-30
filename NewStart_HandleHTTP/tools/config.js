/* ``````````` ## Development By el8rbawY ## ```````````*/
function getTimeTools() {
   let hours = tools.time.current / ((TIME_MAIN * 60 * 60 * 1000) / 24);
   const minutes = Math.floor((hours - Math.floor(hours)) * 60);
   hours = Math.floor(hours);
   hours = hours % 12;
   hours = hours ? hours : 12;
   return `${hours < 10 ? '0' + hours : hours }:${minutes < 10 ? '0' + minutes : minutes } ${hours >= 12 ? 'صباحًا' : 'مساءً'}`;
}