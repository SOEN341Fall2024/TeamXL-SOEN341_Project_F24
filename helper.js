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

export function getTeammateInfo(student_info, sorted_students, idx){
    var numOfTeammates = getNumberOfTeammates(student_info, sorted_students, idx)
    var group_index = getSortedStudentTeamIndex(student_info, sorted_students, idx);

    var teammateInfo = new Array(numOfTeammates);

    for(var i = 0; i < teammateInfo.length; i++){
        teammateInfo[i] = {name : sorted_students[group_index + i].name, id: sorted_students[group_index + i].id};
    }

    return teammateInfo;
}

export function getCommentMadeByStudent(evaluatorID, evaluateeID, student_info){
    for(var i = 0; i < student_info.length; i++){
        if(evaluatorID == student_info[i].id_evaluator && evaluateeID == student_info[i].id_evaluatee){
            console.log(1);
            return student_info[i].comments;
        }
    }

    return "";
}

export function getGradesGivenByStudent(evaluatorID, evaluateeID, student_info){
    //console.log(evaluatorID, evaluateeID);
    for(var i = 0; i < student_info.length; i++){
        if(evaluatorID == student_info[i].id_evaluator && evaluateeID == student_info[i].id_evaluatee){
            console.log(0);
            return {cooperation: student_info[i].cooperation,
                    conceptual_contribution: student_info[i].conceptual_contribution,
                    practical_contribution: student_info[i].practical_contribution,
                    work_ethic: student_info[i].work_ethic,
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
    var index = 0;

    for (var i = 0; i < sorted_students.length; i++){
        if(sorted_students[i].id_group == student_info[idx].id_group){
            index = i;
            break;
        }
    }

    return index;
}

function getStudentInfoTeamIndex(student_info, idx){
    var index = 0;

    for (var i = 0; i < student_info.length; i++){
        if(student_info[i].id_group == student_info[idx].id_group){
            index = i;
            break;
        }
    }

    return index;
}

export function getNumberOfTeammates(student_info, sorted_students, idx){
    var groupIndex = getSortedStudentTeamIndex(student_info, sorted_students, idx);
    var numOfTeammates = 0;

    for(var i = groupIndex; i < sorted_students.length; i++){
        if(sorted_students[i].id_group == student_info[idx].id_group){
           numOfTeammates++; 
        } else {
            break;
        }
    }

    return numOfTeammates;
}

export function getNumberOfReviews(student_info, idx){
    var groupIndex = getStudentInfoTeamIndex(student_info, idx);
    var numOfReviews = 0;

    for(var i = groupIndex; i < student_info.length; i++){
        if(student_info[i].id_evaluator == student_info[idx].id){
            numOfReviews++;
        } else if(student_info[i].id_group != student_info[idx].id_group){
            break;
        }
    }

    return numOfReviews;
}

export function getComments(commentsObj){
    var comments = commentsObj.cooperation;
    comments += commentsObj.conceptual;
    comments += commentsObj.practical;
    comments += commentsObj.work_ethic;
    comments += commentsObj.comments;

    return comments;
}

export function getCommentsObj(comments){
    var commentsObj;
    commentsObj.cooperation = getSplitComment("Coop", comments);
    commentsObj.conceptual = getSplitComment("Conc", comments)
    commentsObj.practical = getSplitComment("Prac", comments);
    commentsObj.work_ethic = getSplitComment("Work", comments);
    commentsObj.comments = getSplitComment("Addi", comments);
}

function getSplitComment(type, comments){
    var splitComment = comments.split("<br/><br/>");

    for(var i = 0; i < splitComment.length; i++){
        if(splitComment[i].substring(0, 5) == type){
            return splitComment[0] + "<br/><br/>";
        }
    }

    return "";
}

export function stringprint(str){
    return str;
}

export async function runAI(prompt) {
    
    const genAI = new GoogleGenerativeAI(Gemini_API_key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    return result.response.text();

}