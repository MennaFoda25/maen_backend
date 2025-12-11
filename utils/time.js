function toMinutes(time){
    const [h,m]= time.split(":").map(Number)
    return h*60 +m 
}

// studentSlot = { start, end }
// teacherSlot = { start, end }
function slotCovers(studentSlot, teacherSlot) {
  const sStart = toMinutes(studentSlot.start);
  const sEnd = toMinutes(studentSlot.end);
  const tStart = toMinutes(teacherSlot.start);
  const tEnd = toMinutes(teacherSlot.end);

  return tStart <= sStart && tEnd >= sEnd;
}

module.exports = { toMinutes, slotCovers };