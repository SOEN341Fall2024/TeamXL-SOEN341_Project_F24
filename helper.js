export function getCooperation(student_info, idx){
    const std_id = student_info[idx].id;
    var cooperation = 0;
    var count = 0;
    do {
        if(idx == student_info.length - 1){
            break;
        }
        cooperation += student_info[idx].cooperation;
        idx++;
        count++;
    } while(std_id == student_info[idx].id)

    return cooperation / count;
}

export function getConceptual(student_info, idx){
    const std_id = student_info[idx].id;
    var conceptual_contribution = 0;
    var count = 0;
    do {
        if(idx == student_info.length - 1){
            break;
        }
        conceptual_contribution += student_info[idx].conceptual_contribution;
        idx++;
        count++;
    } while(std_id == student_info[idx].id)

    return conceptual_contribution / count;
}

export function getPractical(student_info, idx){
    const std_id = student_info[idx].id;
    var practical_contribution = 0;
    var count = 0;
    do {
        if(idx == student_info.length - 1){
            break;
        }
        practical_contribution += student_info[idx].practical_contribution;
        idx++;
        count++;
    } while(std_id == student_info[idx].id)

    return practical_contribution / count;
}

export function getWorkEthic(student_info, idx){
    const std_id = student_info[idx].id;
    var work_ethic = 0;
    var count = 0;
    do {
        if(idx == student_info.length - 1){
            break;
        }
        work_ethic += student_info[idx].work_ethic;
        idx++;
        count++;
    } while(std_id == student_info[idx].id)

    return work_ethic / count;
}

export function getPeers(student_info, idx){
    const std_id = student_info[idx].id;
    var peerIDs = "";
    var count = 0;
    do {
        if(idx == student_info.length - 1){
            break;
        }
        peerIDs += student_info[idx].id_evaluator + " ";
        idx++;
        count++;
    } while(std_id == student_info[idx].id)

    return peerIDs / count;
}