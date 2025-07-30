/* ``````````` ## Development By el8rbawY ## ```````````*/
const vehicleSystem = {
   private: [], // {_id, uniqueID, netID, ownerLic, hash, date}
   employee: [], // {netID, uniqueID, ownerLic, hash, date}
   job: [], // {netID, uniqueID, ownerLic, hash, date}
};

// ---
on('playerDropped', () => {   
   const license = licenseEncrypt(source);
   const index = vehicleSystem.job.findIndex(i => i.ownerLic === license);

   if (index >= 0) {
      DeleteEntity(NetworkGetEntityFromNetworkId(vehicleSystem.job[index].netID));
      vehicleSystem.job.splice(index, 1);
   }
});