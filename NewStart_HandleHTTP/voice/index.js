/* ``````````` ## Development By el8rbawY ## ```````````*/
onNet('NewStart_Factions:handleVoice-server', (type, data) => {
   if (type === 'mute') {
      MumbleSetPlayerMuted(source, data);
   }
});