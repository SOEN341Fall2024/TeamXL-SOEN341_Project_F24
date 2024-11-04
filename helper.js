export function getCooperation(student_info, idx){
    const std_id = student_info[idx].id;
    var cooperation = 0;
    var count = 0;
    do {
        cooperation += student_info[idx].cooperation;
        idx++;
        count++;
    } while(idx != student_info.length && std_id == student_info[idx].id);

    var result = cooperation / count 
    if(isNaN(result)) {result = 0; }
    return result;
}

export function getConceptual(student_info, idx){
    const std_id = student_info[idx].id;
    var conceptual_contribution = 0;
    var count = 0;
    do {
        conceptual_contribution += student_info[idx].conceptual_contribution;
        idx++;
        count++;
    } while(idx != student_info.length && std_id == student_info[idx].id);
    
    var result = conceptual_contribution / count 
    if(isNaN(result)) {result = 0; }
    return result;
}

export function getPractical(student_info, idx){
    const std_id = student_info[idx].id;
    var practical_contribution = 0;
    var count = 0;
    do {
        practical_contribution += student_info[idx].practical_contribution;
        idx++;
        count++;
    } while(idx != student_info.length && std_id == student_info[idx].id);

    var result = practical_contribution / count 
    if(isNaN(result)) {result = 0; }
    return result;
}

export function getWorkEthic(student_info, idx){
    const std_id = student_info[idx].id;
    var work_ethic = 0;
    var count = 0;
    do {
        work_ethic += student_info[idx].work_ethic;
        idx++;
        count++;
    } while(idx != student_info.length && std_id == student_info[idx].id);

    var result = work_ethic / count 
    if(isNaN(result)) {result = 0; }
    return result;
}

export function getPeers(student_info, idx){
    const std_id = student_info[idx].id;
    var peerIDs = "";
    do {
        peerIDs += student_info[idx].id_evaluator + " ";
        idx++;
    } while(idx != student_info.length && std_id == student_info[idx].id);

    return peerIDs;
}

export function getAverage(student_info, idx){
    return (getCooperation(student_info, idx) + getConceptual(student_info, idx) + getPractical(student_info, idx) + getWorkEthic(student_info, idx)) / 4.0 ;
}