export function getCooperation(student_info, idx){
    const std_id = student_info[idx].id;
    let  cooperation = 0;
    let  count = 0;
    do {
        cooperation += student_info[idx].cooperation;
        idx++;
        count++;
    } while(idx != student_info.length && std_id == student_info[idx].id);

    let  result = cooperation / count 
    if(isNaN(result)) {result = 0; }
    return result;
}

export function getConceptual(student_info, idx){
    const std_id = student_info[idx].id;
    let  conceptual_contribution = 0;
    let  count = 0;
    do {
        conceptual_contribution += student_info[idx].conceptual_contribution;
        idx++;
        count++;
    } while(idx != student_info.length && std_id == student_info[idx].id);
    
    let  result = conceptual_contribution / count 
    if(isNaN(result)) {result = 0; }
    return result;
}

export function getPractical(student_info, idx){
    const std_id = student_info[idx].id;
    let  practical_contribution = 0;
    let  count = 0;
    do {
        practical_contribution += student_info[idx].practical_contribution;
        idx++;
        count++;
    } while(idx != student_info.length && std_id == student_info[idx].id);

    let  result = practical_contribution / count 
    if(isNaN(result)) {result = 0; }
    return result;
}

export function getWorkEthic(student_info, idx){
    const std_id = student_info[idx].id;
    let  work_ethic = 0;
    let  count = 0;
    do {
        work_ethic += student_info[idx].work_ethic;
        idx++;
        count++;
    } while(idx != student_info.length && std_id == student_info[idx].id);

    let  result = work_ethic / count 
    if(isNaN(result)) {result = 0; }
    return result;
}

export function getPeers(student_info, idx){
    const std_id = student_info[idx].id;
    let  peerIDs = "";
    do {
        peerIDs += student_info[idx].id_evaluator + " ";
        idx++;
    } while(idx != student_info.length && std_id == student_info[idx].id);

    return peerIDs;
}

export function getAverage(student_info, idx){
    return (getCooperation(student_info, idx) + getConceptual(student_info, idx) + getPractical(student_info, idx) + getWorkEthic(student_info, idx)) / 4.0 ;
}

export function getTeammateInfo(student_info, sorted_students, idx){
    let  numOfTeammates = getNumberOfTeammates(student_info, sorted_students, idx)
    let  group_index = getSortedStudentTeamIndex(student_info, sorted_students, idx);

    let  teammateInfo = new Array(numOfTeammates);

    for(let  i = 0; i < teammateInfo.length; i++){
        teammateInfo[i] = {name : sorted_students[group_index + i].name, id: sorted_students[group_index + i].id};
    }

    return teammateInfo;
}

export function getCommentMadeByStudent(evaluatorID, evaluateeID, student_info){
    for(let student of student_info){
        if(evaluatorID == student.id_evaluator && evaluateeID == student.id_evaluatee){
            return student.comments;
        }
    }

    return "";
}

export function getGradesGivenByStudent(evaluatorID, evaluateeID, student_info){
    //console.log(evaluatorID, evaluateeID);
    for(let student of student_info){
        if(evaluatorID == student.id_evaluator && evaluateeID == student.id_evaluatee){
            return {
                    cooperation: student.cooperation,
                    conceptual_contribution: student.conceptual_contribution,
                    practical_contribution: student.practical_contribution,
                    work_ethic: student.work_ethic,
                };
        }
    }

    return {cooperation: 0,
            conceptual_contribution: 0,
            practical_contribution: 0,
            work_ethic: 0,
    };
}

function getSortedStudentTeamIndex(student_info, sorted_students, idx){
    let  index = 0;

    for (let  i = 0; i < sorted_students.length; i++){
        if(sorted_students[i].id_group == student_info[idx].id_group){
            index = i;
            break;
        }
    }

    return index;
}

function getStudentInfoTeamIndex(student_info, idx){
    let  index = 0;

    for (let  i = 0; i < student_info.length; i++){
        if(student_info[i].id_group == student_info[idx].id_group){
            index = i;
            break;
        }
    }

    return index;
}

export function getNumberOfTeammates(student_info, sorted_students, idx){
    let  groupIndex = getSortedStudentTeamIndex(student_info, sorted_students, idx);
    let  numOfTeammates = 0;

    for(let  i = groupIndex; i < sorted_students.length; i++){
        if(sorted_students[i].id_group == student_info[idx].id_group){
           numOfTeammates++; 
        } else {
            break;
        }
    }

    return numOfTeammates;
}

export function getNumberOfReviews(student_info, idx){
    let  groupIndex = getStudentInfoTeamIndex(student_info, idx);
    let  numOfReviews = 0;

    for(let  i = groupIndex; i < student_info.length; i++){
        if(student_info[i].id_evaluator == student_info[idx].id){
            numOfReviews++;
        } else if(student_info[i].id_group != student_info[idx].id_group){
            break;
        }
    }

    return numOfReviews;
}

export function getComments(commentsObj){
    let  comments = commentsObj.cooperation;
    comments += commentsObj.conceptual;
    comments += commentsObj.practical;
    comments += commentsObj.work_ethic;
    comments += commentsObj.comments;

    return comments;
}

export function stringprint(str){
    return str;
}

export function getCooperationAvg(student_info){
    let  AmountOfReviews = 0;
    let  total = 0;

    for(let student of student_info){
        if(isNaN(student.id_evaluator)){
            continue;
        }
        total += student.cooperation;
        AmountOfReviews++;
    }

    return parseFloat(total / AmountOfReviews * 20).toFixed(2);
}

export function getConceptualAvg(student_info){
    let  AmountOfReviews = 0;
    let  total = 0;

    for(let student of student_info){
        if(isNaN(student.id_evaluator)){
            continue;
        }
        total += student.conceptual_contribution;
        AmountOfReviews++;
    }

    return parseFloat(total / AmountOfReviews * 20).toFixed(2);
}

export function getPracticalAvg(student_info){
    let  AmountOfReviews = 0;
    let  total = 0;

    for(let student of student_info.length){
        if(isNaN(student.id_evaluator)){
            continue;
        }
        total += student.practical_contribution;
        AmountOfReviews++;
    }

    return parseFloat(total / AmountOfReviews * 20).toFixed(2);
}

export function getWorkEthicAvg(student_info){
    let  AmountOfReviews = 0;
    let  total = 0;

    for(let student of student_info.length){
        if(isNaN(student.id_evaluator)){
            continue;
        }
        total += student.work_ethic;
        AmountOfReviews++;
    }

    return parseFloat(total / AmountOfReviews * 20).toFixed(2);
}

export function appendGroupMembers(group, student_info){
    let  studentArr = [];
    for(let student of student_info){
        if(group.id_group == student.id_group){
            studentArr.push(student);
        }
    }

    group.members = studentArr;
}