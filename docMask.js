/**
 * @fileOverview word→html変換したhtml(子フレーム)にJqueryは入っていないので、Jqueryを子フレームで使用したい場合
 * $[tgt].contents().find()で探し当てて使用する
 * ただ上記は直感的でないため、可能な限り生のjavascriptで記述する
 * @author NEC
 * @version 1.0.0
 */

//定数等
const MSG_EDIT = "「編集」ボタンをクリックしてから編集を行ってください。";
const OFFSET_X = 10;
const OFFSET_Y_NORMAL = -90;
const OFFSET_Y_BOTTOM = -180;
const TAG_RED = "tagRed";
const TAG_MASK = "tagMsk";

const STATE_MASK = 1;
const STATE_RED = 2;
const MASK_MSG = "■";
/*const MASK_NORMAL = "*";*/
const MASK_NORMAL = "l";
const MASK_BF = "<span class='tagMsk' id='msk";
const MASK_BF_INIT = "<span class='tagMsk tagMskInit' id='msk";
const MASK_BF_END = "<span class='tagMsk tagMskEnd' id='msk";
const RED_BF = "<span class='tagRed' id='red";
const RED_BF_INIT = "<span class='tagRed tagRedInit' id='red";
const RED_BF_END = "<span class='tagRed tagRedEnd' id='red";
const MASK_END_CLS = "tagMskEnd";
const RED_END_CLS = "tagRedEnd";
const MASK_AF = "</span>";
const RED_AF = "</span>";
const MASK_INIT_CLS = "tagMskInit";
const RED_INIT_CLS = "tagRedInit";

const NODE_CROSS = 1;
const SPACE_MARK = '&nbsp;';
const REG_TAG_VAL_SPLIT = "(<\\/?[^>]+>)|([^<]+)";
const RED_ID_RED = 'red[0-9]{7}';
// const ORG_GET = '(?<=<span class="tagRed" id="red[0-9]{7}">).(?=</span>)'; //肯定的先読み+肯定的後読み
const RED_ORG_GET = '<span class="tagRed" id="red[0-9]{7}"[\\s\\S]*?>(.)</span>';
const NORMAL_MENU = 1;
const MASK_MENU = 2;
const SVG_MENU = 3;
//20200131
const OBJECT_MENU = 4;
const MULTI_IMAGE = 5;

const ID_OFFSET = 4;
const ELEMENT_NODE_TYPE = 1;
const TEXT_NODE_TYPE = 3;
const RIGHT_TYPE = 2;
// const EDIT_ABLE="btn-success";
const EDIT_ABLE = "on";
const BTN_DISABLE = 'bottonDisable';
const ACT_POLICY = 'actPolicy';
const ID_COUNT = 1000000;
const CHART_POLICY = "図・表"; //図表専用ポリシー
const RED_IMG = 'redimg';

// 跨ぎ対応
const TAG_RED_CLASS = 'tagRed';
const TAG_RED_INIT_CLASS = 'tagRed tagRedInit';
const TAG_AWDIV_CLASS = 'awdiv';
const TAG_AWSPAN_CLASS = 'awspan';
const AT_AG_NAME = 'A';
const BR_TAG_NAME = 'BR';
const SPAN_TAG_NAME = 'SPAN';
const RED_INIT_ORG_GET = '<span class="tagRed tagRedInit" id="red[0-9]{7}"[\\s\\S]*?>(.)</span>';
const MASK_ORG_GET = '<span class="tagMsk" id="msk[0-9]{7}"[\\s\\S]*?>(.)</span>';
const RED_ID_GET = "<span class='tagRed' id='red[0-9]{7}'>(.)</span>";

//20200114 badge処理追加
const RED_BADGE_INIT = "<span class='redNumber' id='bdg";
const MSK_BADGE_INIT = "<span class='mskNumber' id='bdg";
const BADGE_DELETE = '<span class="redNumber" id="bdg[0-9]{7}">(.)</span>';

// const TEXT_NODE_TYPE = '#text';
//20200131 <object><svg>処理
const OBJECT_TAG_NAME = 'OBJECT';
const TAG_ID_REG = '<([a-zA-Z]*) [\\s\\S]*?id="([a-zA-Z]{3}[0-9]{7})"[\\s\\S]*?>';
const CLASS_REG = 'class="([\\s\\S]*?)"';

const PATH_REG = '(<path [\\s\\S]*?fill=")[\\s\\S]*?("[\\s\\S]*?)/>';

/**
 グローバル変数
*/
var glObjRedFlame = null;
var glObjRedBody = null;
var glObjMaskFlame = null;
var glObjMaskBody = null;
var glContextDom = null;
var glActContext = null;
//暫定で1200000余裕があればAIのマスク連番(サーバサイド処理)と合わせる
var glIdCnt = ID_COUNT + 200000;
var glActBfId = "";
var glActAfId = "";
var glActPolicy = 0;
var glObjRange = null;
var glSelectInitId = null;
var glSelectEndId = null;
var glArrRepOrgOuter = [];
var glArrMaskOrgOuter = [];
var glNewRangeFlg = false;
var glTmpFileFlg = false; //tmpfileがあるか判定する //true 存在 false なし

//範囲変更前にinnerHTMLを保持
var glRangeRedTmpInner = "";
var glRangeRMskTmpInner = "";

//暫定で1300000 余裕があればAIのマスク連番(サーバサイド処理)と合わせる
var glMaskIdCnt = ID_COUNT + 300000;
var glRedIdCnt = ID_COUNT + 300000;
//20200218 暫定で2000000 svgに追加するタグid
var glRedSvgIdCnt = ID_COUNT + 1000000;
var glMskSvgIdCnt = ID_COUNT + 1000000;

//サーバからajaxで持ってくるポリシー情報
var glPolicyLists = [];
//以下の配列は同インデックスで保持
var glArrBfIds = []; //黒塗り先頭ID
var glArrAfIds = []; //黒塗り終了ID
var glArrPolicys = []; //黒塗り対象のIDに紐づくポリシーID
var glArrRepOuter = []; //黒塗り候補変更後のOuterHtml
var glRemarks = [] //黒塗りリストの備考
//以下の配列は同インデックスで保持 end

var glChartId = -1; //図表のpolicyIdを保持
var glHashPolicy = {} //ポリシーのマッピング ID:Name

var glDocumentInfoLists = []; //document情報

//以下黒塗り跨ぎ
var glStrideStartStr;
var glStrideEndStr;
var glStrideStartOffset;
var glStrideEndOffset;
var glStrideStartId;
var glStrideEndId;
var glStrideBlackList = [];

//20200129 iframe内のobjectタグ保持用
var glObjRedInDocs = [];
var glObjMskInDocs = [];
var glObjRedInSvg = [];
var glObjMskInSvg = [];

//20200207 svg右クリック時の選択したidを保持
var glSvgSelectElementId = "";
var glSvgBlackPaintFlag = false;
var glObjRedInDocsInnerHtml = [];
var glObjMskInDocsInnerHtml = [];
// var glObjRedBfSvgOuterHtml = []; //黒塗り候補変更前のOuterHtml

// var glBadgeDisabledFlag = false;
var glBadgeDisabledFlag = true;

/**
************Class************
*/

/**
 * @class HtmlStructure HTMLのchar毎の情報を格納するクラス
 * HashMap<Integer, HtmlStructure> の形で格納し、keyは置換対象外文字やtagを含んだポジション
 * (<div>タグ等を含む)を格納する
 */
class HtmlStructure {
    strTgt = ""; //対象文字
    intPage = 0; //Page
    intStatus = 0; //strTgtのステータス 0：置換対象外(半角文字等) 1：対象 2：tag
    intNotTagPos = 0; //置換対象外文字やtagを抜いたときのポジション
} //class

/**
 * @class listInfoCls 黒塗りリスト表示画面の情報を格納するクラス
 */
class listInfoCls {
    //黒塗りリスト表示画面に送付する配列を作成
    keywords = []; //黒塗り単語の配列
    pages = [];  //登場箇所の配列
    policyNames = []; //ポリシー名の配列
    Reasons = []; //黒塗り対処理由の配列
    Remarks = [] //黒塗りリストで記述した備考

    //20191107 add
    glArrBfIds = []; //黒塗り先頭ID
    glArrAfIds = []; //黒塗り終了ID
    glArrPolicys = []; //黒塗り対象のIDに紐づくポリシーID
    glArrRepOuter = []; //黒塗り候補変更後のOuterHtml
    glRemarks = []; //黒塗り先頭ID
    //20200114 badge対応
    pageBadge = [];

    //20200221 svg対応
    svgRedVal = [];
    svgRedSrc = [];
    svgMskVal = [];
    svgMskSrc = [];
      // 20200310 FileId
    glIntFileId = [];

} //class

/**
************通常関数************
*/

/**
* 初期処理を実行する
 * @function
*/
function bootOpen() {
    var repDiv = $("#repDiv");
    var maskDiv = $("#maskDiv");

    maskDiv.scroll(function () {
        repDiv.scrollTop(maskDiv.scrollTop());
        repDiv.scrollLeft(maskDiv.scrollLeft());
    }); //maskDiv.scroll(function ()


    repDiv.scroll(function () {
        maskDiv.scrollTop(repDiv.scrollTop());
        maskDiv.scrollLeft(repDiv.scrollLeft());
    }); //repDiv.scroll(function ()

    //userIdセット
    if (!isUserId()) {
        setUserId();
    } //if

    //user名セット
    if (!isUserName()) {
        setUserName();
    } //if

    //policy 取得
    getPolicyAll();
    //document情報
    getDocumentInfo(glDocumentId);
    //アイコンを入れ替える
    if (glDocumentInfoLists[0].extension === "txt") {
        document.getElementsByClassName("icon_l")[0].src = "./css/images/l_file_node.gif";
        document.getElementsByClassName("icon_s")[0].src = "./css/images/file_node.gif"
        document.getElementsByClassName("icon_s")[1].src = "./css/images/file_node.gif"
    } else if (glDocumentInfoLists[0].extension === "pdf") {
        // glBadgeDisabledFlag = true;
        document.getElementsByClassName("icon_l")[0].src = "./css/images/l_file_pdf.gif";
        document.getElementsByClassName("icon_s")[0].src = "./css/images/file_pdf.gif"
        document.getElementsByClassName("icon_s")[1].src = "./css/images/file_pdf.gif"
    } else if (glDocumentInfoLists[0].extension === "xlsx" || glDocumentInfoLists[0].extension === "xls" || glDocumentInfoLists[0].extension === "xlsm") {
        // glBadgeDisabledFlag = true;
        document.getElementsByClassName("icon_l")[0].src = "./css/images/l_file_excel.gif";
        document.getElementsByClassName("icon_s")[0].src = "./css/images/file_excel.gif"
        document.getElementsByClassName("icon_s")[1].src = "./css/images/file_excel.gif"
    } else if (glDocumentInfoLists[0].extension === "pptx" || glDocumentInfoLists[0].extension === "ppt" || glDocumentInfoLists[0].extension === "pptm") {
        // glBadgeDisabledFlag = true;
        document.getElementsByClassName("icon_l")[0].src = "./css/images/l_file_powerpoint.gif";
        document.getElementsByClassName("icon_s")[0].src = "./css/images/file_powerpoint.gif"
        document.getElementsByClassName("icon_s")[1].src = "./css/images/file_powerpoint.gif"
    }//if

    //20200218 Word,Textの場合候補番号が切替出来るようにする
    if (glBadgeDisabledFlag) {
        var badgeOff = document.getElementById("badgeOff");
        var badgeOn = document.getElementById("badgeOn");
        badgeOn.checked = false;
        badgeOff.checked = true;
        badgeOn.disabled = true;
        badgeOff.disabled = true;
    }


    //コンテキストメニューのポリシーリスト作成
    document.getElementById('rangeSet').innerHTML = makePolicyList(glPolicyLists, 0);
    document.getElementById('policyMod').innerHTML = makePolicyList(glPolicyLists, 1);

    //glEditMarkerを各配列に分割する
    splitEditMarker(glEditMarker);


    //一時保存データがあるか確認する
    TmpInfoGet();  //ajaxだとreturnがうまくいかないのでGLに格納
    if (!glTmpFileFlg) {
        $('#SAIKAI').toggleClass(BTN_DISABLE);
        $('#HOZON_SAKUJYO').toggleClass(BTN_DISABLE);
    } //if

    //20200204 AI黒塗りポリシーを表示する
    if (glPolicySelect == "-1") {
        document.getElementById('AI_Policy').innerHTML = "-";
    } else {
        var strPolicyList = "";
        var policyCnt = 0;
        var arrSelectPolicy = glPolicySelect.split(",");
        for (let i = 0; i < arrSelectPolicy.length; i++) {
            for (let j = 0; j < glPolicyLists.length; j++) {
                if (arrSelectPolicy[i] == glPolicyLists[j].policyId && policyCnt == 0) {
                    strPolicyList = glPolicyLists[j].policyName
                    policyCnt++;
                } else if (arrSelectPolicy[i] == glPolicyLists[j].policyId && policyCnt > 0) {
                    policyCnt++;
                }
            }
        } //for
        if (policyCnt > 1) {
            strPolicyList += "、他" + (policyCnt - 1) + "件"
        }
        document.getElementById('AI_Policy').innerHTML = strPolicyList;


    }

} //functionL

/**
 * 再開、保存削除ボタン制御 classがBTN_DISABLEのときは押下不可可能
 * @function
 */
function tmpBtnStateCng() {
    $('#SAIKAI').toggleClass(BTN_DISABLE);
    $('#HOZON_SAKUJYO').toggleClass(BTN_DISABLE);
} //function

/**
 * 再開、保存削除ボタンを強制再開
 * @function
 */
function tmpBtnStateRemove() {
    $('#SAIKAI').removeClass(BTN_DISABLE);
    $('#HOZON_SAKUJYO').removeClass(BTN_DISABLE);
} //function


/**
 * 再開、保存状態を判定する
 * @function
 * @returns {Boolean}  true 保存なし,false 保存あり
 */
function isTmpBtn() {
    if ($('#SAIKAI').hasClass(BTN_DISABLE)) {
        return true;
    } //if
    return false;
} //function

/**
 * ポリシー選択状態を判定する
 * @function
 */
function isPolicyBtn() {
    if ($('#POLICY_SENTAKU').hasClass(BTN_DISABLE)) {
        return true;
    } //if
    return false;
} //function

/**
* policy一覧を取得する
* @return boolean
*/
function getPolicyAll() {
    $.ajax({
        type: 'GET',
        url: 'rest/policy/all',
        processData: false, // Ajaxがdataを整形しない指定
        contentType: false, // contentTypeもfalseに指定(Fileをアップロード時は必要)
        async: false, //非同期false
        success: function (retData) {
            glPolicyLists = JSON.parse(retData);
            for (let i = 0; i < glPolicyLists.length; i++) { //nullがあったら空文字にする
                //nullは空文字にしておく
                for (const key in glPolicyLists[i]) {
                    if (glPolicyLists[i][key] === null) {
                        glPolicyLists[i][key] = '';
                    } //if
                } //for
            } //for

            console.log("success");
            return false;
        }, //function
        error: function (e) {
            console.log("fail",e);
            return false;
        } //function
    }); //ajax
} //function

/**
 * glEditMarkerを各配列に分割する
 * @function
 * @param {String} strEditMarker_i 黒塗り先頭ID:黒塗り終了ID:policyID構成 複数ある場合は+でセパレート
 */
function splitEditMarker(strEditMarker_i) {
    glArrBfIds = []; //黒塗り先頭ID
    glArrAfIds = []; //黒塗り終了ID
    glArrPolicys = []; //黒塗り対象のIDに紐づくポリシーID
    glRemarks = [];

    if (strEditMarker_i !== "") { //空文字は通さない
        var arrMulti = strEditMarker_i.split('+');
        for (let i = 0; i < arrMulti.length; i++) {
            var arrTmp = arrMulti[i].split(':');
            for (let j = 0; j < arrTmp.length; j++) {
                glArrBfIds[i] = arrTmp[0];
                glArrAfIds[i] = arrTmp[1];
                glArrPolicys[i] = Number(arrTmp[2]);
                glRemarks[i] = "";
            } //for
        } //for
    } //if


} //function

/**
 * 黒塗り箇所範囲選択用のOuterHtmlを作成する
 * @function
 */
function makeMaskOuter() {
    //iframeが呼ばれるまでloopSleepをループ
    var blRet = false;
    loopSleep(50, 100, function (i) {
        if (blRet) {
            // breakと同等
            console.log("waitIframe Success");
            return false;
        } //if
        blRet = waitIframe();
    });
    console.log("waitIframe end");

    //黒塗り箇所範囲選択用のOuterHtmlだけ作成しておく
    var objTgtFlame = document.getElementById("red").contentDocument;
    var objTgtBody = document.getElementById("red").contentDocument.body;
    for (let i = 0; i < glArrBfIds.length; i++) {
        //20200221 Object Svgは特にいらないので作成しない
        var objChkDom = glObjRedFlame.getElementById(glArrBfIds[i]);
        var intBfPos = "";
        var intAfPos = "";
        var strTmp = "";
        // 対象のidがobject内ではない時
        if (objChkDom !== null) {
            intBfPos = objTgtBody.innerHTML.indexOf(objTgtFlame.getElementById(glArrBfIds[i]).outerHTML);
            intAfPos = objTgtBody.innerHTML.indexOf(objTgtFlame.getElementById(glArrAfIds[i]).outerHTML) + objTgtFlame.getElementById(glArrAfIds[i]).outerHTML.length;
            strTmp = objTgtBody.innerHTML.substring(intBfPos, intAfPos);
        } //if
        glArrRepOuter[i] = strTmp;
    } //for
} //function


/**
 * glEditMarkerを作成する
 * @function
 * @return {String} 黒塗り先頭ID:黒塗り終了ID:policyID構成 複数ある場合は+でセパレート
 */
function makeEditMarker() {
    var strRet = "";
    for (let i = 0; i < glArrBfIds.length; i++) {
        strRet += glArrBfIds[i] + ':';
        strRet += glArrAfIds[i] + ':';
        strRet += glArrPolicys[i] + '+';
    } //for

    if (strRet !== '') {
        strRet = strRet.substr(0, strRet.length - 1);
    } //if
    return strRet;

} //function

/**
 * マスク候補、マスクで置換した文字列を元の文字列に戻す
 * @function
 * @param {String} strBfBody 置き換えられる文字列
 * @param {String} strAfBody 置き換える新しい文字列
 * @return {String} 置換したBody文字列
 */
function bodyCharReturn(strBfBody, strAfBody) {
    var strRepVal = "";
    //基本マスク候補対象 余裕があればリファクタリング
    var strInnerBody = glObjRedFlame.body.innerHTML;
    var objPattern = new RegExp(RED_ORG_GET, 'gi'); //グルーピングで入れ替える
    var strAct = strInnerBody.substring(strBfBody.length, strInnerBody.indexOf(strAfBody));
    strAct = strAct.replace(' ' + RED_INIT_CLS, '').replace(' ' + RED_END_CLS, ''); //RED_INIT_CLSとRED_END_CLSだけは消し込んどく
    strRepVal = strAct.replace(objPattern, '$1');

    //20200114 badge消込処理追加
    var objPattern = new RegExp(BADGE_DELETE, 'gi');
    strRepVal = strRepVal.replace(objPattern, '');

    return strRepVal;
} //function

/**
 * strの文字列をbeforeStrをafterStrに全置換する
 * @function
 * @param {String} str 置換対象文字列
 * @param {String} beforeStr 置き換えられる文字列
 * @param {String} afterStr 置き換える新しい文字列
 * @returns　{String} 置換文字列
 */
function replaceAll(str, beforeStr, afterStr) {
    var reg = new RegExp(beforeStr, "g");
    return str.replace(reg, afterStr);
} //function

/**
 * 半角記号を全角スペースにする
 * @function
 * @param {String} strTgt_i 置換対象文字列
 * @return 置換後のストリング
 */
function replaceHalfSpace(strTgt_i) {
    var strReplace = replaceAll(strTgt_i, SPACE_MARK, "　");
    return strReplace;
} //function

/**
 * 全てのタグにIDを付与する(もともとIDある場合は処理スキップ)
 * @function
 * @param {Object} objTgtDom_i 処理対象DOM
 * @param {String} strTagName_i ID
 */
function allIdPut(objTgtDom_i, strTagName_i) {
    var strActId = objTgtDom_i.getAttribute("id");

    if (glCancelFlg !== "4") { //紐づけ時は通さない
        if (strActId === null) {
            objTgtDom_i.setAttribute("id", strTagName_i + glIdCnt);
            glIdCnt++;
            // 20200207 svgドキュメント内の場合既にidがあっても振りなおす
        } else if (objTgtDom_i.ownerSVGElement !== undefined) {
            //svg内のimageを置換した<rect...にはidを付与しない
            if (objTgtDom_i.id.indexOf('rct') === -1) {
                objTgtDom_i.setAttribute("id", strTagName_i + glIdCnt);
                glIdCnt++;
            }//if
        } //if

        for (var index = glIdCnt; index < objTgtDom_i.childElementCount; index++) {
            var objActDom = objTgtDom_i.children[index];
            strActId = objActDom.getAttribute("id");
            if (strActId === null) {
                objActDom.setAttribute("id", strTagName_i + index);
                glIdCnt++;
            } //if
        } // for
        if (objTgtDom_i.childElementCount != 0) {
            for (var index = 0; index < objTgtDom_i.childElementCount; index++) {
                var objActDom = objTgtDom_i.children[index];
                allIdPut(objActDom, strTagName_i);
            } // for
        }//if
    } //if

} //function

/**
 * コンテキストメニューのポリシーリストのInnerHTMLを作成する
 * @function
 * @param {Array} arrPolicyLists_i policyのリスト
 * @param {Number} intState_i 0:候補・ポリシー指定用：1：ポリシー変更
 * @returns {String} InnerHTML
 */
function makePolicyList(arrPolicyLists_i, intState_i) {
    var strRet = "";
    // var intChartOFFSET = 0;
    for (var i = 0; i < arrPolicyLists_i.length; i++) {
        intPolicy = arrPolicyLists_i[i].policyId;
        intPolicyName = arrPolicyLists_i[i].policyName;
        if (arrPolicyLists_i[i].policyType === 1) { //図・表は表示しない
            glChartId = arrPolicyLists_i[i].policyType; //ポリシーIDだけ保持
            // intChartOFFSET++; //図表分だけずれるOFFSET
        } else if (intState_i === 0 && (arrPolicyLists_i[i].policyType === 0 || arrPolicyLists_i[i].policyType === 2)) {
            strRet += '<li><a id="tgt' + intPolicy + '" onClick=tgtMaskChk(' + intPolicy + ')>' + arrPolicyLists_i[i].policyName + '</a></li> ';
            glHashPolicy[intPolicy] = intPolicyName; //マッピングを保持
        } else if (intState_i === 1 && (arrPolicyLists_i[i].policyType === 0 || arrPolicyLists_i[i].policyType === 2)) {
            strRet += '<li><a id="mod' + intPolicy + '" onClick=policyMod(' + intPolicy + ')>' + arrPolicyLists_i[i].policyName + '</a></li> ';
            glHashPolicy[intPolicy] = intPolicyName; //マッピングを保持
        } //if
    } //for

    return strRet;
}//function

/**
 * bodyの構造体hashを取得
 * @function
 * @param {String} strOrgBody_i DOM
 * @return {Object} HtmlStructureのハッシュ
 */
function getBodyStructure(strOrgBody_i) {
    var strTgtVal = strOrgBody_i;

    var hashRetStructure = {};
    var listLastNotTagPos = []; //intNotTagPosを格納していく
    var strReg = REG_TAG_VAL_SPLIT; //タグとタグを除いた値をグループで取得する
    var objPattern = new RegExp(strReg, "g");
    var strCurrentKwd = ""; //現在ヒットしている単語
    var intCurrentPos = 0;
    var objRegRet;
    while ((objRegRet = objPattern.exec(strTgtVal)) != null) {
        strCurrentKwd = objRegRet[2];
        if (strCurrentKwd == undefined) { //タグの処理
            strCurrentKwd = objRegRet[1];
            searchAnalysis(hashRetStructure, listLastNotTagPos, strCurrentKwd, intCurrentPos, 2);
        } else if (strCurrentKwd == SPACE_MARK) { //スペース処理 「strCurrentKwd == " " ||」と「strCurrentKwd == "　" || 」を除外し、通常文字処理をさせる
            searchAnalysis(hashRetStructure, listLastNotTagPos, strCurrentKwd, intCurrentPos, 0);
            continue; //スペースはそのまま格納
        } else if (Boolean(strCurrentKwd.match(/^\t$|^\v$|^\n$|^\r$|^\f$/g))) { //特殊記号処理(特殊記号のみの場合のみ処理)
            searchAnalysis(hashRetStructure, listLastNotTagPos, strCurrentKwd, intCurrentPos, 0);
            continue; //特殊記号処理はそのまま格納
        } else if (strCurrentKwd.match(/\t{5}/g)) { //PDFのタグ対応 スルーする
            continue; //特殊記号処理はそのまま格納
        } else { //通常文字
            searchAnalysis(hashRetStructure, listLastNotTagPos, strCurrentKwd, intCurrentPos, 1);
        } //if
        intCurrentPos = Object.keys(hashRetStructure).length;

    }  //while

    return hashRetStructure;
} //function

/**
 * 検索結果からbodyの構造体hashを作成する
 * @function
 * @param HashMap<Integer, HtmlStructure> hashRetStructure_i 参照渡しのハッシュ
 * HtmlStructureはHTMLのchar毎の情報を格納するクラス
 * HashMap<Integer, HtmlStructure> の形で格納し、keyは置換対象外文字やtagを含んだポジション(<div>タグ等を含む)を格納する
 * @param {String} strCurrentKwd_i 現在正規表現でヒットしている文字列
 * @param {Number} intCurrentPos_i タグを含めた現在のposition
 * @param {Number} intStatus_i 0：置換対象外(半角文字等) 1：対象 2：tag
 */
function searchAnalysis(hashRetStructure_i, listLastNotTagPos_i, strCurrentKwd_i, intCurrentPos_i, intStatus_i) {
    var intCntPos = Object.keys(hashRetStructure_i).length;
    var intNotTagPos = 0;
    objHtmlStructure = null;
    var arrTmp = strCurrentKwd_i.split("");
    var strTgt = "";

    if (listLastNotTagPos_i.length != 0) { //tag抜き文字の最終を取得する
        intNotTagPos = listLastNotTagPos_i[listLastNotTagPos_i.length - 1];
    } //if

    for (var i = 0; i < arrTmp.length; i++) {
        objHtmlStructure = new HtmlStructure();
        strTgt = arrTmp[i];
        objHtmlStructure.strTgt = strTgt;
        objHtmlStructure.intStatus = intStatus_i;
        if (intStatus_i == 1) { //通常文字はintNotTagPosをカウント
            intNotTagPos++;
            objHtmlStructure.intNotTagPos = intNotTagPos;
        } //if
        hashRetStructure_i[intCntPos + (i + 1)] = objHtmlStructure;
    } //for

    if (intStatus_i == 1) { //通常時はtag抜き文字の最終を格納
        listLastNotTagPos_i.push(intNotTagPos);
    } //if
} //function

/**
 * 選択領域の文字列を置換してbodyを入れ替え、または赤文字変換した文字列を取得
 * @function
 * @param {Object} hashBodyStructure_i HTMLのchar毎の情報を格納するクラスを格納したhash key：HTMLのindex : val HTMLのchar(index)毎の情報を格納するクラス
 * @param {Number} intMaskStatus_i 置換ステータス :マスク 2:赤文字
 * @return {String} 置換したBody文字列
 */
function bodyCharChange(hashBodyStructure_i, intMaskStatus_i) {
    var strRepBody = "";
    var intStatus = 0;
    var blFlag = true;
    var intIndCnt = Object.keys(hashBodyStructure_i).length;
    for (var i = 1; i < Object.keys(hashBodyStructure_i).length + 1; i++) {
        var objHtmlStructure = hashBodyStructure_i[i];
        intStatus = objHtmlStructure.intStatus;
        intNotTagPos = objHtmlStructure.intNotTagPos;
        if (intStatus == 1  && !objHtmlStructure.strTgt.match((/^\n$|^\r$/g))) { //20200310 通常文字の場合改行除く
            if (intMaskStatus_i == 1 && blFlag && objHtmlStructure.strTgt !== " ") { //初期だけ特別クラス 先頭半角スペース以外はマスク
                strRepBody += MASK_BF_INIT + glMaskIdCnt + "'>" + MASK_MSG + MASK_AF; //マスク
                blFlag = false;
                glMaskIdCnt++;
            } else if (intMaskStatus_i == 1 && blFlag && objHtmlStructure.strTgt === " ") { // 先頭半角スペースはマスクしない
                strRepBody += MASK_BF_INIT + glMaskIdCnt + "'>" + objHtmlStructure.strTgt + MASK_AF; //マスクしない
                blFlag = false;
                glMaskIdCnt++;
            } else if (blFlag) { //初期だけ特別クラス
                strRepBody += RED_BF_INIT + glRedIdCnt + "'>" + objHtmlStructure.strTgt + RED_AF; //赤塗り
                blFlag = false;
                glRedIdCnt++;
            } else if (intMaskStatus_i == 1 && i == intIndCnt && objHtmlStructure.strTgt === " ") { // 最終文字が半角スペースの場合
                strRepBody += MASK_BF_END + glMaskIdCnt + "'>" + objHtmlStructure.strTgt + MASK_AF; //マスクしない
                blFlag = false;
                glMaskIdCnt++;
            } else if (intMaskStatus_i == 1 && i == intIndCnt) { //最後も特別クラス
                strRepBody += MASK_BF_END + glMaskIdCnt + "'>" + MASK_MSG + MASK_AF; //マスク
                blFlag = false;
                glMaskIdCnt++;
            } else if (i == intIndCnt) { //最後も特別クラス
                strRepBody += RED_BF_END + glRedIdCnt + "'>" + objHtmlStructure.strTgt + RED_AF; //赤塗り
                blFlag = false;
                glRedIdCnt++;
            } else if (intMaskStatus_i == 1 && objHtmlStructure.strTgt === " ") { // マスクフラグ 半角スペースの場合
                strRepBody += MASK_BF + glMaskIdCnt + "'>" + objHtmlStructure.strTgt + MASK_AF; //マスクしない
                glMaskIdCnt++;
            } else if (intMaskStatus_i == 1) {
                strRepBody += MASK_BF + glMaskIdCnt + "'>" + MASK_MSG + MASK_AF; //マスク
                glMaskIdCnt++;
            } else {
                strRepBody += RED_BF + glRedIdCnt + "'>" + objHtmlStructure.strTgt + RED_AF; //赤塗り
                glRedIdCnt++;
            } //if

        } else { //その他の場合そのまま出力する
            strRepBody += objHtmlStructure.strTgt;
        } //if
    } //for
    return strRepBody;
} //function

/**
 * 引数の文字列をtagとそれ以外に分割する
 * @param {String} strTgtVal_i 対象文字列
 * @param {Array} arrTag_i タグを格納
 * @param {Array} arrNotTag_i タグ以外を格納
 */
function splitTagArr(strTgtVal_i, arrTag_i, arrNotTag_i) {
    var strTgtVal = strTgtVal_i;
    var strReg = REG_TAG_VAL_SPLIT; //タグとタグを除いた値をグループで取得する
    var objPattern = new RegExp(strReg, "g");
    var strCurrentKwd = ""; //現在ヒットしている単語
    var objRegRet;
    while ((objRegRet = objPattern.exec(strTgtVal)) != null) {
        strCurrentKwd = objRegRet[2];
        if (strCurrentKwd == undefined) { //タグ
            strCurrentKwd = objRegRet[1];
            arrTag_i.push(strCurrentKwd);
            arrNotTag_i.push(""); //indexを合わせるために空文字を挿入
        } else { //通常文字
            arrTag_i.push("");//indexを合わせるために空文字を挿入
            arrNotTag_i.push(strCurrentKwd);
        } //if
    }  //while
} //function

/**
 * 引数の文字列の最終がタグか判定する
 * @param {String} strTgtVal_i 対象文字列
 * @return {Boolean} tag:true tag以外 false
 */
function isLastTag(strTgtVal_i) {
    var strTgtVal = strTgtVal_i;
    var strReg = REG_TAG_VAL_SPLIT; //タグとタグを除いた値をグループで取得する
    var objPattern = new RegExp(strReg, "g");
    var strCurrentKwd = ""; //現在ヒットしている単語
    var objRegRet;
    var blRet = false;
    while ((objRegRet = objPattern.exec(strTgtVal)) != null) {
        strCurrentKwd = objRegRet[2];
        if (strCurrentKwd == undefined) { //タグ
            blRet = true;
        } else { //通常文字
            blRet = false;
        } //if
    }  //while
    return blRet;
} //function

/**
 * マスク候補IFlame内の選択指定している範囲のbodyInnerHtmlからの距離を返す
 * @function
 * @return {Array} 0:intInitPartPos,1:intEndPartPosの配列
 */
function getSelectionInnerPos(blackPaintFlag, frontBlackPointFlag, backBlackPointFlag, frontRowCnt, endRowCnt) {
    var blackFlag = blackPaintFlag || false;
    var frontFlag = frontBlackPointFlag || false;
    var backFlag = backBlackPointFlag || false;
    //選択されていなかったらreturn
    if (glObjRedFlame.getSelection().toString() == "") {
        return;
    } //if

    var objSelection = glObjRedFlame.getSelection(); // 選択範囲のオブジェクト取得
    var objTgtRange = objSelection.getRangeAt(0); //rangeを取得
    var objInitDom = null;
    var objEndDom = null;
    var strInnerBody = glObjRedFlame.body.innerHTML;

    /**
    * memo Dom横断の場合のobjTgtRange.startOffset,objTgtRange.endOffsetの挙動
    *「objTgtRange.startContainer.wholeText」から何文字OffsetしたかがobjTgtRange.startOffset
    *「objTgtRange.endContainer.wholeText」から何文字OffsetしたかがobjTgtRange.endOffset
    *また、wholeTextはDOMのinnerTextと一致するのでそこから捜索する
    */
    var startContainer = objTgtRange.startContainer;
    var endContainer = objTgtRange.endContainer;
    var startClassName = startContainer.parentNode.className;
    // 先頭と最後尾のidを取得する
    if (startContainer.nodeType === TEXT_NODE_TYPE) {
        // classNameにSVGAnimatedString型の値が入る事があるため文字列かチェックする
        if (typeof startClassName === 'string' || startClassName instanceof String) {
            glSelectInitId = startContainer.parentNode.id;
        }
    }
    if (endContainer.nodeType === TEXT_NODE_TYPE) {
        var endClassName = endContainer.parentNode.className;
        if (typeof endClassName === 'string' || endClassName instanceof String) {
            glSelectEndId = endContainer.parentNode.id;
        }
    }
    //部分文字列の前半取得 glSelectEndId
    //glSelectInitIdとglSelectEndIdがどちらが先にあるIDか調べてglSelectEndIdのほうが早かったら入れ替える
    var intInitPos = strInnerBody.indexOf(glSelectInitId);
    var intEndPos = strInnerBody.indexOf(glSelectEndId);

    // txtデータの場合先頭が黒塗りのときにIDの逆転現象が起こり得るため実施しない
    if (intInitPos > intEndPos && !(frontFlag && glDocumentInfoLists[0].extension === "txt")) {
        var strTmp1 = glSelectInitId;
        var strTmp2 = glSelectEndId;
        glSelectInitId = strTmp2;
        glSelectEndId = strTmp1;
    } //if

    try {
        var objInitDom = glObjRedFlame.getElementById(glSelectInitId)
        var objInitParentDom = glObjRedFlame.getElementById(glSelectInitId)

        var intInitChildCnt = objInitDom.childElementCount;
        var objInitNode = objSelection.anchorNode;//Selectionのアンカーとは、選択の開始点
        var objPrevDom = objInitNode.previousSibling;
        var blChildFlg = false;

        if (intInitChildCnt > 0 && (objPrevDom != null)) { //子要素がある場合かつ前のdomが無い
            blChildFlg = true;
        } //if

        var strInitInner = objInitParentDom.innerHTML.toString();
        var strInitOuter = objInitParentDom.outerHTML.toString();
        var intInitOutPos;
        var intInitPartPos;
        if (blChildFlg) { //子要素がある場合
            if (blackFlag && frontFlag) {
                intInitPartPos = strInnerBody.indexOf(strInitOuter);
            } else {
                // 選択した先頭の文字がTEXTの場合、その1個前の兄弟からIDを取得する
                if (objTgtRange.startContainer.nodeType === TEXT_NODE_TYPE) {
                    var id = objTgtRange.startContainer.previousSibling.id;
                    var objInitParentDom = glObjRedFlame.getElementById(id);
                    strInitOuter = objInitParentDom.outerHTML.toString();
                    intInitPartPos = strInnerBody.indexOf(strInitOuter) + strInitOuter.length + objTgtRange.startOffset;
                } else if (objTgtRange.startContainer.nodeType === ELEMENT_NODE_TYPE && 0 < frontRowCnt ) { //先頭に改行があった場合
                    // 先頭改行のouterHTML
                    var df = objTgtRange.cloneContents();
                    firstHtmlId = df.firstElementChild.id;
                    if(1 < frontRowCnt){
                        // 2つ以上改行がある場合は、改行のタグ分の長さを計算
                        frontRowCnt = frontRowCnt * firstHtmlId.length;
                    } else {
                        frontRowCnt = 0; //1でも0
                    }
                    // 改行を除去した場合の先頭index
                    intInitPartPos = strInnerBody.indexOf(firstHtmlId) + firstHtmlId.length + 2 + frontRowCnt; // TODO ">の2文字に加え、改行があった数だけ足す

                } else {
                    intInitPartPos = strInnerBody.indexOf(objTgtRange.startContainer.wholeText) + objTgtRange.startOffset;
                } //if
            }
        } else { //子要素がない場合
            var strInitPart = strInitInner.substr(objTgtRange.startOffset, strInitInner.length);
            strInitPart = strInitOuter.substr(strInitOuter.lastIndexOf(strInitPart), strInitOuter.length); //閉じタグプラス
            intInitOutPos = strInnerBody.indexOf(strInitOuter);
            // intInitPartPos = intInitOutPos;
            if (blackFlag && frontFlag) {
                intInitPartPos = intInitOutPos;
            } else {
                intInitPartPos = intInitOutPos + strInitOuter.lastIndexOf(strInitPart);
            }
        } //if

        //部分文字列の後半取得
        var objEndParentDom = glObjRedFlame.getElementById(glSelectEndId);

        var objEndNode = objSelection.focusNode; //Selectionのフォーカスとは、選択の終了点
        var objPrevDom = objEndNode.previousSibling;
        blChildFlg = false;
        blChildFind = false;
        if (intInitChildCnt > 0 && (objPrevDom != null)) { //子要素がある場合かつ前のdomが無い
            blChildFlg = true;
        } //if

        var strEndOuter = objEndParentDom.outerHTML.toString();

        var intEndPartPos;
        // intChildOffcet = 0;
        if (blChildFlg) { //子要素がある場合
            if (blackFlag && backFlag) {
                intEndPartPos = strInnerBody.indexOf(strEndOuter) + strEndOuter.length;
            } else {
                // 選択した最後尾の文字がTEXTの場合、その1個前の兄弟からIDを取得する
                if (objTgtRange.endContainer.nodeType === TEXT_NODE_TYPE) {
                    var id = objTgtRange.endContainer.previousSibling.id;
                    var objEndParentDom = glObjRedFlame.getElementById(id);
                    strEndOuter = objEndParentDom.outerHTML.toString();
                    intEndPartPos = strInnerBody.indexOf(strEndOuter) + strEndOuter.length + objTgtRange.endOffset;
                } else if (objTgtRange.endContainer.nodeType === ELEMENT_NODE_TYPE && 0 < endRowCnt) {
                    // 後方改行のouterHTML
                    var df = objTgtRange.cloneContents();
                    lastHtmlId = df.lastElementChild.id;
                    // 改行を除去した場合の先頭index
                    intEndPartPos = strInnerBody.indexOf(lastHtmlId) + lastHtmlId.length + 2; // TODO ">の2文字を加える

                } else {
                    intEndPartPos = strInnerBody.indexOf(objTgtRange.endContainer.wholeText) + objTgtRange.endOffset
                }
            }
        } else { //子要素がない場合
            objPattern = new RegExp(RED_ID_RED, "gi");
            var strEndId = strEndOuter.match(objPattern)[0];
            var strEndOuter = glObjRedFlame.getElementById(strEndId).outerHTML; //Endのアウターをさきに取得

            var hashBodyStructure = {};
            var intTagLen = 0;
            //20200306 1文字半角スペース選択した時のマッチ条件追加
            if ((blackFlag && backFlag) || (blackFlag && 1 === glObjRedFlame.getSelection().toString().length && glDocumentInfoLists[0].extension === "txt")) {
                intEndPartPos = strInnerBody.indexOf(strEndOuter) + strEndOuter.length;
            } else if (blackFlag && !backFlag && objTgtRange.endContainer.previousSibling) {
                var id = objTgtRange.endContainer.previousSibling.id;
                var objEndParentDom = glObjRedFlame.getElementById(id);
                strEndOuter = objEndParentDom.outerHTML.toString();
                intEndPartPos = strInnerBody.indexOf(strEndOuter) + strEndOuter.length + objTgtRange.endOffset;
            } else {
                hashBodyStructure = getBodyStructure(strEndOuter); //hashBodyStructureを作成してtagとtag以外を振り分ける
                for (var i = 1; i < Object.keys(hashBodyStructure).length + 1; i++) {
                    var objHtmlStructure = hashBodyStructure[i];
                    var intStatus = objHtmlStructure.intStatus;
                    intNotTagPos = objHtmlStructure.intNotTagPos;
                    if (intStatus == 1) { //通常文字の場合
                        break; //innerTextになるのでbreak
                    } else {
                        intTagLen++;  //tagの文字数を数える
                    } //if
                } //for
                var strOuterPart = strEndOuter.substr(0, intTagLen + objTgtRange.endOffset); //EndのOuterHtmlの部品
                intEndPartPos = strInnerBody.indexOf(strOuterPart) + strOuterPart.length;
            }

        }//if
        var arrRet = [];
        arrRet.push(intInitPartPos);
        arrRet.push(intEndPartPos);
        return arrRet;
    } catch (error) {
        var arrRet = [];
        arrRet[0] = 0;
        arrRet[1] = 0;
        arrRet[2] = error;
        return arrRet;
    } //try


} //function

/**
* 選択指定している範囲のマスク、マスク候補を変更する
* @function
* @param {Number} policyId ポリシーID
*/
async function tgtMaskChk(policyId_i) {

    // 選択範囲の情報取得
    var selectVal = glObjRedFlame.getSelection().toString();
    var selectionGlObjRedFlame =  glObjRedFlame.getSelection();
    var range = selectionGlObjRedFlame.getRangeAt(0);
    var df = range.cloneContents();

    //選択されていなかったらreturn
    if (selectVal == "") {
        return;
    } else if(selectVal == " "){ // 半角スペース1字の場合は後続処理なし
        alert("半角スペース1文字が選択されたため処理を終了します。");
        contextNone();
        return;
    }//if

    // 選択された先頭、末尾文字を取得
    var frontVal = selectVal.substr(0, 1);
    var endVal = selectVal.substr(-1, 1);
    var frontRowCnt = 0; //先頭改行数
    var endRowCnt = 0; //末尾改行数

    // 先頭から改行以外になるまで繰り返す
    while(frontVal.match(/\n/)){
        // 先頭1文字を削除
        selectVal = selectVal.slice(1);
        var frontVal = selectVal.substr(0, 1);
        frontRowCnt++;
    }
    // 末尾から改行以外になるまで繰り返す
    while(endVal.match(/\n/)){
        // 末尾1文字を削除
        selectVal = selectVal.slice(0, -1);
        var endVal = selectVal.substr(-1, 1);
        endRowCnt++;
    }

    // 選択した先頭及び、最後尾が黒塗りか確認
    var blackPoint = blackPointCheck(range, frontRowCnt, endRowCnt); //パラメータに改行数
    //選択した先頭要素が黒塗り文字か(true:黒塗)
    var frontBlackPointFlag = blackPoint.get("frontBlackPointFlag")
    //選択した最後尾要素が黒塗り文字か(true:黒塗)
    var backBlackPointFlag = blackPoint.get("backBlackPointFlag");

    var strTgtVal = "";
    var arrPos = getSelectionInnerPos(true, frontBlackPointFlag, backBlackPointFlag, frontRowCnt, endRowCnt);
    var blackPaintFlag = false;

    // badge削除対象
    var delBdgIdList = [];

    // 黒塗りチェック１
    if (glDocumentInfoLists[0].extension === "txt") {
        if (arrPos.length >= 3) {
            var frontId = frontBlackPointFlag ? df.firstElementChild.id : "idNull";
            var backId = backBlackPointFlag ? df.lastElementChild.id : "idNull";
            // 選択範囲補正
            correctionSelectRange(frontId, backId, range);
            arrPos = getSelectionInnerPos();
            blackPaintFlag = true;
        } //if
    }

    var intInitPartPos = null;
    var intEndPartPos = null;
    var strInnerBody = "";
    var strMaskInnerBody = "";
    var strBfBody = "";
    var strAfBody = "";
    var strMaskBfBody = "";
    var strMaskAfBody = "";

    intInitPartPos = arrPos[0];
    intEndPartPos = arrPos[1];
    strInnerBody = glObjRedFlame.body.innerHTML;
    strMaskInnerBody = glObjMaskFlame.body.innerHTML;

    //値を実際に取得
    strTgtVal = strInnerBody.substring(intInitPartPos, intEndPartPos);
    strBfBody = strInnerBody.substr(0, intInitPartPos);
    strAfBody = strInnerBody.substring(intEndPartPos, strInnerBody.length);

    strMakkTgtVal = strMaskInnerBody.substring(intInitPartPos, intEndPartPos);
    strMaskBfBody = strMaskInnerBody.substr(0, intInitPartPos);
    strMaskAfBody = strMaskInnerBody.substring(intEndPartPos, strMaskInnerBody.length);

    // var strReg = RED_ORG_GET;
    strReg = RED_INIT_CLS + "|" + RED_END_CLS;
    objPattern = new RegExp(strReg, "gi");
    if (objPattern.test(strTgtVal) || frontBlackPointFlag || backBlackPointFlag) {
        blackPaintFlag = true;
        if (glDocumentInfoLists[0].extension === "txt") {
            if (arrPos.length < 3) {
                //1文字解除の場合(childElementCountが0)
                if (0 === df.childElementCount){
                    /* 1文字の場合はdf.firstElementChildに値がない
                       そのためフラグによってfrontIdとbackIdにdf.firstElementChildと同じ値のrange.startContainer.parentElement.idをセット */
                    var frontId = frontBlackPointFlag ? range.startContainer.parentElement.id : "idNull";
                    var backId = backBlackPointFlag ? range.startContainer.parentElement.id : "idNull";
                } else {
                    // 黒塗りチェック１に該当しない場合
                    var frontId = frontBlackPointFlag ? df.firstElementChild.id : "idNull";
                    var backId = backBlackPointFlag ? df.lastElementChild.id : "idNull";
                }
                // 選択範囲補正
                correctionSelectRange(frontId, backId, range);
            }
        } else {
            var frontId = frontBlackPointFlag ? blackPoint.get("frontBlackPointID") : "idNull";
            var backId = backBlackPointFlag ? blackPoint.get("backBlackPointID") : "idNull";
            // 選択範囲補正
            correctionSelectRange(frontId, backId, range);
        }
        // 補正後の値で再度黒塗り文書取得
        arrPos = getSelectionInnerPos(true, frontBlackPointFlag, backBlackPointFlag, frontRowCnt, endRowCnt);
        glStrideBlackList = [];
        intInitPartPos = arrPos[0];
        intEndPartPos = arrPos[1];
        strInnerBody = glObjRedFlame.body.innerHTML;
        strMaskInnerBody = glObjMaskFlame.body.innerHTML;
        //値を実際に取得
        strTgtVal = strInnerBody.substring(intInitPartPos, intEndPartPos);
        strBfBody = strInnerBody.substr(0, intInitPartPos);
        strAfBody = strInnerBody.substring(intEndPartPos, strInnerBody.length);

        strMakkTgtVal = strMaskInnerBody.substring(intInitPartPos, intEndPartPos);
        strMaskBfBody = strMaskInnerBody.substr(0, intInitPartPos);
        strMaskAfBody = strMaskInnerBody.substring(intEndPartPos, strMaskInnerBody.length);

        // 黒塗り候補削除
        var objPatternInit = new RegExp(RED_INIT_ORG_GET, 'gi'); //グルーピングで入れ替える
        var blackIdList = strTgtVal.match(objPatternInit);
        // グローバルから選択範囲の黒塗り削除
        for (var idx = 0; idx < blackIdList.length; idx++) {
            var str = blackIdList[idx];
            var objPatternRedId = new RegExp(RED_ID_RED);
            var id = str.match(objPatternRedId);
            var intIndex = glArrBfIds.indexOf(id[0]);
            glArrBfIds.splice(intIndex, 1);
            glArrAfIds.splice(intIndex, 1);
            glArrPolicys.splice(intIndex, 1);
            glArrRepOuter.splice(intIndex, 1);
            // badge削除対象を保持する
            delBdgIdList.push(id[0]);
        }
        // RED削除(Wordの場合)
        var objPatternRedInit = new RegExp(' ' + RED_INIT_CLS, 'gi');
        var objPatternRedEnd = new RegExp(' ' + RED_END_CLS, 'gi');
        var objPatternRed = new RegExp(RED_ORG_GET, 'gi'); //グルーピングで入れ替える
        strTgtVal = strTgtVal.replace(objPatternRedInit, '').replace(objPatternRedEnd, ''); //RED_INIT_CLSとRED_END_CLSだけは消し込んどく
        strTgtVal = strTgtVal.replace(objPatternRed, '$1');
        // MASK削除(Wordの場合)
        var objPatternMaskInit = new RegExp(' ' + MASK_INIT_CLS, 'gi');
        var objPatternMaskEnd = new RegExp(' ' + MASK_END_CLS, 'gi');
        var objPatternMask = new RegExp(MASK_ORG_GET, 'gi'); //グルーピングで入れ替える
        strMakkTgtVal = strMakkTgtVal.replace(objPatternMaskInit, '').replace(objPatternMaskEnd, ''); //RED_INIT_CLSとRED_END_CLSだけは消し込んどく
        strMakkTgtVal = strMakkTgtVal.replace(objPatternMask, '$1');
    } //if

    //画像は範囲選択で含めない(単体でマスク指定)
    var strImgRegrep = '\<img';
    var objImgPattern = new RegExp(strImgRegrep, "gi");
    //20200131 選択範囲にsvgで表示されている画像を含めない処理の追加
    var strSvgRegrep = '\<svg';
    var objSvgPattern = new RegExp(strSvgRegrep, "gi");
    var strObjectgRegrep = '\<object';
    var objObjectPattern = new RegExp(strObjectgRegrep, "gi");
    if (objImgPattern.test(strTgtVal) || objSvgPattern.test(strTgtVal) || objObjectPattern.test(strTgtVal)) {
        alert("画像が選択箇所に入っています。\n画像をマスク処理する際は、画像自体を右クリックして「候補指定」を行ってください。");
        contextNone();
        return;
    } //if

    //マスク候補処理
    var hashBodyStructure = {};
    hashBodyStructure = getBodyStructure(strTgtVal);
    var strRepVal = bodyCharChange(hashBodyStructure, STATE_RED);


    //bodyを入れ替える
    var strChangeBody = strBfBody + strRepVal + strAfBody;
    glObjRedBody.innerHTML = strChangeBody;

    //マスク処理
    var hashBodyMaskStructure = getBodyStructure(strMakkTgtVal);
    var strMaskRepVal = bodyCharChange(hashBodyMaskStructure, STATE_MASK);

    //bodyを入れ替える
    var strMaskChangeBody = strMaskBfBody + strMaskRepVal + strMaskAfBody;
    glObjMaskBody.innerHTML = strMaskChangeBody;

    //グローバルに黒塗り先頭ID,黒塗り終了ID,黒塗り対象のIDに紐づくポリシーID,OuterHTMLを保持
    var objPatternRedInit = new RegExp(' ' + RED_INIT_CLS, 'gi');
    var objPatternRedEnd = new RegExp(' ' + RED_END_CLS, 'gi');
    var objPatternInit = new RegExp(RED_ID_GET, 'gi'); //グルーピングで入れ替える
    var objPattern = new RegExp(RED_ID_RED, "g");
    strRepVal = strRepVal.replace(objPatternRedInit, '').replace(objPatternRedEnd, ''); //RED_INIT_CLSとRED_END_CLSだけは消し込んどく
    var blackIdList = strRepVal.match(objPatternInit);

    var arrRedIds = [];
    for (var idx = 0; idx < blackIdList.length; idx++) {
        var str = blackIdList[idx];
        var id = str.match(objPattern);
        arrRedIds[idx] = id[0];
    }

    // var arrRedIds = strRepVal.match(objPattern);
    var strBfId = arrRedIds[0];
    var strAfId = arrRedIds[arrRedIds.length - 1];

    glArrBfIds.push(strBfId);
    glArrAfIds.push(strAfId);
    glArrPolicys.push(policyId_i);
    glArrRepOuter.push(strRepVal);

    glRemarks.push("");

    // 黒塗り化した<span>に横幅を追加
    addWidthBlackPaint();
    // 旧badge削除
    for (var idx = 0; idx < delBdgIdList.length; idx++) {
        //候補番号を表示
        if (!glBadgeDisabledFlag) {
            //badgeを削除
            deleteBadge(glActBfId);
        }
    }

    //object再更新
    await exchangeObjectElement();

    //マスク番号再計算
    if (!glBadgeDisabledFlag) {
        // innnerHTML時に<object>が初期化されてしまうため元に戻す
        makeMaskBadge();
        //object再更新
        await exchangeObjectElement();
    }//if
    contextNone();

} //function

/**
* 選択範囲をもとの文書に戻す
* @function
* @Param bfId 黒塗り開始ID
* @Param afId 黒塗り終了ID
*/
async function tgtMaskOrg(bfId, afId) {
    // var strBfId = glActBfId;
    // var strAfId = glActAfId;
    var strBfId = bfId;
    var strAfId = afId;
    var strOrg = "";

    // 追加した横幅を削除する
    deleteWidthBlackPaint(bfId, afId);

    //bodyを入れ替える(マスク候補)
    var objBfOuter = glObjRedFlame.getElementById(strBfId);
    var objAfOuter = glObjRedFlame.getElementById(strAfId);
    var strInnerBody = glObjRedFlame.body.innerHTML;
    var intInitPos = strInnerBody.indexOf(objBfOuter.outerHTML);
    var intEndPos = strInnerBody.indexOf(objAfOuter.outerHTML) + objAfOuter.outerHTML.length
    var strBfBody = strInnerBody.substr(0, intInitPos);
    var strAfBody = strInnerBody.substring(intEndPos, strInnerBody.length);

    strOrg = bodyCharReturn(strBfBody, strAfBody);
    var strChangeBody = strBfBody + strOrg + strAfBody;
    glObjRedBody.innerHTML = strChangeBody;

    //bodyを入れ替える(マスク)
    strBfId = strBfId.replace("red", "msk");
    strAfId = strAfId.replace("red", "msk");
    objBfOuter = glObjMaskFlame.getElementById(strBfId);
    objAfOuter = glObjMaskFlame.getElementById(strAfId);
    strInnerBody = glObjMaskFlame.body.innerHTML;
    intInitPos = strInnerBody.indexOf(objBfOuter.outerHTML);
    intEndPos = strInnerBody.indexOf(objAfOuter.outerHTML) + objAfOuter.outerHTML.length
    strBfBody = strInnerBody.substr(0, intInitPos);
    strAfBody = strInnerBody.substring(intEndPos, strInnerBody.length);
    strOrg = replaceAll(strOrg, "red", "msk");
    strChangeBody = strBfBody + strOrg + strAfBody;

    glObjMaskBody.innerHTML = strChangeBody;

    // innnerHTML時に<object>が初期化されてしまうため元に戻す
    await exchangeObjectElement();

    if (!glBadgeDisabledFlag) {
        //マスク番号再計算
        makeMaskBadge();
        // object再更新
        await exchangeObjectElement();
    }

    contextNone();

} //function


/**
　* 選択範囲を開放する
 * @function
　*/
async function tgtMaskRelease() {

    //元のbodyに戻す
    await tgtMaskOrg(glActBfId, glActAfId);
    //配列要素から削除 glActBfId
    var intIndex = glArrBfIds.indexOf(glActBfId);
    glArrBfIds.splice(intIndex, 1);
    glArrAfIds.splice(intIndex, 1);
    glArrPolicys.splice(intIndex, 1);
    glArrRepOuter.splice(intIndex, 1);

    glRemarks.splice(intIndex, 1);

    //候補番号を表示
    if (!glBadgeDisabledFlag) {
        //badgeを削除
        deleteBadge(glActBfId);
        //マスク番号再計算
        makeMaskBadge();
        //object再更新
        await exchangeObjectElement();
    }
    contextNone();
} //function

/**
 * 黒塗り候補を選択状態にする
 * @function
 * @param {Event} イベント
 */
function getRedRange(e) {
    //glArrRepOuterから選択するIDを捜索
    var strActId = e.target.id;
    var intIndex = 0;
    for (var i = 0; i < glArrRepOuter.length; i++) {
        var objTgt = glArrRepOuter[i];
        if (objTgt.indexOf(strActId) >= 0) {
            intIndex = i;
            break;
        } //if
    } //for

    var objPattern = new RegExp(RED_ID_RED, "g");
    var arrRedIds = glArrRepOuter[intIndex].match(objPattern);
    // var arrRedIds =  $('#red').contents().find('#'+strActId).siblings(); //兄弟要素じゃないもの取れないので却下

    var strBfId = arrRedIds[0];
    var strAfId = arrRedIds[arrRedIds.length - 1];
    //rangeの作成
    objRange = glObjRedFlame.createRange();
    objRange.setStart(glObjRedFlame.getElementById(strBfId), 0);
    objRange.setEnd(glObjRedFlame.getElementById(strAfId), glObjRedFlame.getElementById(strAfId).innerText.length);
    var objTgtSelection = glObjRedFlame.getSelection();
    glObjRedBody.focus();
    objTgtSelection.removeAllRanges();
    objTgtSelection.addRange(objRange);
    //id,policy,rangeをグローバルに保持
    glActBfId = strBfId;
    glActAfId = strAfId;
    intIndex = 0;
    intIndex = glArrBfIds.indexOf(strBfId);
    glActPolicy = glArrPolicys[intIndex];
    glObjRange = objRange;

} //function


/**
 **********イベント イベント操作関係 **********
*/

/**
 * 独自コンテキストメニューを閉じる
 * @function
 */
function contextNone() {

    $("#policyMod").find(".actPolicy").removeClass(ACT_POLICY);
    document.getElementById('contextmenu').style.display = "none";
    document.getElementById('contextmenu_red').style.display = "none";
    document.getElementById('contextmenu_img').style.display = "none";
    document.getElementById('contextmenu_img_return').style.display = "none";
    document.getElementById('contextmenu_svg').style.display = "none";
    document.getElementById('contextmenu_svg_return').style.display = "none";
    document.getElementById('contextmenu_multi_img').style.display = "none";
    document.getElementById('contextmenu_multi_img_return').style.display = "none";



} //fanction

/**
 * mouseUpActイベント
 * @function
 * @param {Event} e イベント
 */
function mouseUpAct(e) { //contextメニューが出てないときだけ処理する
    if (e.button != 2) { //右クリック時は無視
        glSelectEndId = e.target.id;
        console.log("glSelectEndId : " + glSelectEndId);
    } //if
} //function

/**
 * マウスダウンイベント
 * @function
 * @param {Event} e イベント
 */
function mouseDownAct(e) {

    if (e.button == 0) { //通常クリック時のみ発火
        glSelectInitId = e.target.id;
        console.log("glSelectInitId : " + glSelectInitId);
    } //if
    contextNone();
} //function

/**
 * コンテキストメニュー(右クリック)を表示する
 * @param {Event} e イベント
 * @param {Number} intStatus_i メニュー種別
 */
function contextOpen(e, intStatus_i) {

    var intTop = 0;
    if (e.screenY >= 500) { //画面下部で右クリック時はメニューを右上に出す
        intTop = e.screenY + OFFSET_Y_BOTTOM;
    } else {
        intTop = e.screenY + OFFSET_Y_NORMAL;
    } //if

    if (intStatus_i == NORMAL_MENU) {
        var objTgtDom = $('#contextmenu')[0];
        if (e.screenX > 0) {
            objTgtDom.style.left = e.screenX - window.screenX + OFFSET_X + "px";
            objTgtDom.style.top = intTop + "px";
            objTgtDom.style.display = "block";
        } else {
            objTgtDom.style.left = e.screenX + window.screen.availWidth + OFFSET_X + "px";
            objTgtDom.style.top = intTop + "px";
            objTgtDom.style.display = "block";
        }
    } else if (intStatus_i == MASK_MENU) {
        var objTgtDom = $('#contextmenu_red')[0];
        if (e.screenX > 0) {
            objTgtDom.style.left = e.screenX - window.screenX + OFFSET_X + "px";
            objTgtDom.style.top = intTop + "px";
            objTgtDom.style.display = "block";
        } else {
            objTgtDom.style.left = e.screenX + window.screen.availWidth + OFFSET_X + "px";
            objTgtDom.style.top = intTop + "px";
            objTgtDom.style.display = "block";
        }
        //対象Policyを探し当てて色替え
        var intIndex = glArrBfIds.indexOf(glActBfId);
        var intTgtPolicy = glArrPolicys[intIndex];
        $("#mod" + intTgtPolicy).addClass(ACT_POLICY);

    } else if (e.target.tagName === 'IMG' && intStatus_i != MULTI_IMAGE) { //タグ時処理
        //対象のタグidを格納
        glSelectEndId = e.target.id;
        if (e.target.classList.contains(RED_IMG)) { //すでにマスク後か判定
            var objTgtDom = $('#contextmenu_img_return')[0];
            if (e.screenX > 0) {
                objTgtDom.style.left = e.screenX - window.screenX + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } else {
                objTgtDom.style.left = e.screenX + window.screen.availWidth + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } //if
        } else {
            var objTgtDom = $('#contextmenu_img')[0];
            if (e.screenX > 0) {
                objTgtDom.style.left = e.screenX - window.screenX + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } else {
                objTgtDom.style.left = e.screenX + window.screen.availWidth + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } //if
        } //if
        //画像がsvgのとき
    } else if (intStatus_i == SVG_MENU) {
        //対象のタグidを格納
        glSelectEndId = e.target.ownerSVGElement.id;
        var redimgFlag = e.target.ownerSVGElement.classList.contains(RED_IMG);
        if (glDocumentInfoLists[0].extension.indexOf('doc') === -1) { ////Wordファイル以外の場合
            //右クリックで選択されたelementのidも保持しておく
            glSvgSelectElementId = e.target.id;
            redimgFlag = e.target.classList.contains(RED_IMG);
        } //if

        if (redimgFlag) {
            // if(e.target.ownerSVGElement.classList.length!=0){ //すでにマスク後か判定
            var objTgtDom = $('#contextmenu_svg_return')[0];
            if (e.screenX > 0) {
                objTgtDom.style.left = e.screenX - window.screenX + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } else {
                objTgtDom.style.left = e.screenX + window.screen.availWidth + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } //if
        } else {
            var objTgtDom = $('#contextmenu_svg')[0];
            if (e.screenX > 0) {
                objTgtDom.style.left = e.screenX - window.screenX + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } else {
                objTgtDom.style.left = e.screenX + window.screen.availWidth + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } //if
        } //if
    } else if (intStatus_i == OBJECT_MENU) {
        //対象のタグidを格納
        glSelectEndId = e.target.id;
        if (e.target.classList.contains(RED_IMG)) {
            // if(e.target.ownerSVGElement.classList.length!=0){ //すでにマスク後か判定
            var objTgtDom = $('#contextmenu_svg_return')[0];
            if (e.screenX > 0) {
                objTgtDom.style.left = e.screenX - window.screenX + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } else {
                objTgtDom.style.left = e.screenX + window.screen.availWidth + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } //if
        } else {
            var objTgtDom = $('#contextmenu_svg')[0];
            if (e.screenX > 0) {
                objTgtDom.style.left = e.screenX - window.screenX + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } else {
                objTgtDom.style.left = e.screenX + window.screen.availWidth + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } //if
        } //if
    } else if (intStatus_i == MULTI_IMAGE) {
        //対象のタグidを格納
        glSelectEndId = e.target.id;
        if (e.target.classList.contains(RED_IMG)) {
            // if(e.target.ownerSVGElement.classList.length!=0){ //すでにマスク後か判定
            var objTgtDom = $('#contextmenu_multi_img_return')[0];
            if (e.screenX > 0) {
                objTgtDom.style.left = e.screenX - window.screenX + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } else {
                objTgtDom.style.left = e.screenX + window.screen.availWidth + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } //if
        } else {
            var objTgtDom = $('#contextmenu_multi_img')[0];
            if (e.screenX > 0) {
                objTgtDom.style.left = e.screenX - window.screenX + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } else {
                objTgtDom.style.left = e.screenX + window.screen.availWidth + OFFSET_X + "px";
                objTgtDom.style.top = intTop + "px";
                objTgtDom.style.display = "block";
            } //if
        } //if
    } //if

} //fanction

/**
 * コンテキストメニュー(右クリック)操作関数
 * @function
 * @param {Event} e イベント
*/
function contextFunc(e) {
    glActContext = e; //context保持
    var blEdit = isEdit();

    console.log(e.screenY);

    if (!(blEdit)) { //編集ボタンが押されていなかったらアラートを出して戻す
        alert(MSG_EDIT);
        return;
    } //if


    var objSelection = glObjRedFlame.getSelection(); // 選択範囲のオブジェクト取得
    var strClsChk = e.target.getAttribute("class");

    var objSelection = glObjRedFlame.getSelection(); // 選択範囲のオブジェクト取得
    var strClsChk = e.target.getAttribute("class");

    // 選択された文字列
    var selectVal = objSelection.toString();
    // 1文字以上改行コードのみの場合メニューを表示しない
    var replaceSelectVal = selectVal.replace(/\n/g, "");
    if(selectVal.length > 0 && replaceSelectVal.length == 0){
        contextNone();
        return;
    }

    if (strClsChk == null) strClsChk = "";

    //20200131 object右クリック時の判定
    var objClickFlag = false;
    if (e.target.firstElementChild) {
        if (e.target.firstElementChild.tagName === OBJECT_TAG_NAME) objClickFlag = true;//if
    }//if
    //20200203 複数の画像が選択されている判定
    var imgSelectsFlag = false;
    if (objSelection.toString() == "") {
        if (objSelection.anchorNode) {
            // 選択範囲に文字列はないが開始終了のidが異なる場合画像が複数選択されている
            if (objSelection.anchorNode.id != objSelection.focusNode.id) {
                imgSelectsFlag = true;
            }
        }
    }
    if (imgSelectsFlag) {
        console.log("複数のイメージ選択状態");
        contextOpen(e, MULTI_IMAGE);
    } else if (e.target.tagName === 'IMG') { //対象tagがIMGなら図表用のコンテキストメニューを開く
        contextOpen(e, 3);

    } else if (objSelection != "") { //選択されていたらNORMAL_MENUを開く
        contextOpen(e, NORMAL_MENU);
        //20200131追加
        //20200131追加
    } else if (
        // (e.target.tagName === 'svg' || e.target.tagName === 'SVG') ||
        (e.target.ownerSVGElement !== undefined && e.target.ownerSVGElement !== null)) {//ownerがSVGならSVG_MENUを開く
        contextOpen(e, SVG_MENU);
    } else if (objClickFlag) {//objectがクリックされたならOBJECT_MENUを開く
        contextOpen(e, OBJECT_MENU);
    } else if (strClsChk.indexOf(TAG_RED) >= 0) { //対象クラスがTAG_REDならMASK_MENUを開く
        getRedRange(e);
        contextOpen(e, MASK_MENU);
    } //if
} //function

/**
 * 編集ボタン制御 classがEDIT_ABLEのときだけ編集可能
 * @function
 */
function editBtnStateCng() {
    $('#HENSHU').toggleClass(EDIT_ABLE);
    $('#POLICY_SENTAKU').addClass(BTN_DISABLE);

} //function

/**
 * 編集可能、不可能を判定する
 * @function
 * @returns {Boolean} true 編集可能,false 編集不可
 */
function isEdit() {
    if ($('#HENSHU').hasClass(EDIT_ABLE)) {
        return true;
    } //if
    return false;
} //function

/**
 * ポリシーを変更する
 * @function
 * @param {Number} intPolicy_i ポリシーID
 */
async function policyMod(intPolicy_i) {
    //現在と変更後のPolicyをひきあててアラート
    var strPolicyName = glHashPolicy[glActPolicy];
    var strModName = glHashPolicy[intPolicy_i];

    // var strPolicyName = glPolicyLists[glActPolicy - 1].policyName;
    // var strModName = glPolicyLists[intPolicy_i - 1].policyName;
    var blRet = confirm("現在のポリシー「" + strPolicyName + "」から「" + strModName + "」へ変更してよろしいですか？");
    if (blRet) {
        var intIndex = glArrBfIds.indexOf(glActBfId); //現在のポリシーのINDEX(ポリシーだと一意にならないのでマッピングしてるglActBfIdにて取得)
        glArrPolicys[intIndex] = intPolicy_i; //新しいポリシーに変更
    } //if

    //マスク番号再計算(念の為)
    if (!glBadgeDisabledFlag) {
        makeMaskBadge(); //if
        // object埋め込み
        await exchangeObjectElement();
    } //if
    contextNone();
} //functon

/**
 * 黒塗りリストのjsonを作成する
 * @function
 * @return {String} 作成したJSON文字列
 */
async function makeMaskJson() {
    //黒塗りリスト表示画面に送付する配列を作成
    var keywords=[]; //黒塗り単語の配列
    var pages=[];  //登場箇所の配列
    var policyNames=[]; //ポリシー名の配列
    var Reasons=[]; //黒塗り対処理由の配列
    var Remarks=[]; //黒塗り対処理由の配列

    //黒塗りリスト表示画面に送付する配列を作成
    var tmpKeyWords=[]; //黒塗り単語の配列
    var tmpPages=[];  //登場箇所の配列
    var tmpPolicyNames=[]; //ポリシー名の配列
    var tmpReasons=[]; //黒塗り対処理由の配列
    var tmpRemarks=[]; //黒塗り対処理由の配列
    var tmpArrBfIds=[];
    var tmpArrAfIds=[];
    var tmpArrPolicys=[];
    var tmpArrRepOuter=[];
    //20200114 badge対応
    var tmpBadges = [];
    //20200220
    var objectIds = []; //objectの場合idを保持しておく

    // badgeを非表示のドキュメントの場合ここで番号を計算する
    if (glBadgeDisabledFlag) {
        makeMaskBadge();
        //念の為object埋め込み
        await exchangeObjectElement();
    }  //if

    var intCnt=0;
    //黒塗り単語の配列 ポリシー名の配列 黒塗り対処理由の配列作成
    for (let i = 0; i < glArrPolicys.length; i++) {
        for (let j = 0; j < glPolicyLists.length; j++) {
            var intDiffPolicy=Number(glPolicyLists[j].policyId);
            if (glArrPolicys[intCnt]===intDiffPolicy) {
                policyNames[intCnt]=glPolicyLists[j].policyName;
                Reasons[intCnt]=glPolicyLists[j].policyReason;
                var redId = glArrBfIds[intCnt];
                // 対象のidがobject内ではない時は弾く
                var objChkDom = glObjRedFlame.getElementById(glArrBfIds[i]);
                if (objChkDom !== null) {
                    //キーワード取得
                    var intBfPos = glObjRedBody.innerHTML.indexOf(glObjRedFlame.getElementById(glArrBfIds[i]).outerHTML);
                    var intAfPos = glObjRedBody.innerHTML.indexOf(glObjRedFlame.getElementById(glArrAfIds[i]).outerHTML) + 
                        glObjRedFlame.getElementById(glArrAfIds[i]).outerHTML.length;
                    var strTmp = glObjRedBody.innerHTML.substring(intBfPos, intAfPos); //対象のアウター
                    //innerTextを取得するため、tmpの親を作成し、OuterHTMLを埋め込む
                    var objTmpParent = $('<div></div>').append(strTmp);
                    keywords[intCnt] = objTmpParent[0].innerText;
                    intCnt++;
                }else{ //ObjectのIDは後ほど使用するので取得
                    objectIds.push(redId);
                } //if
            } //if
        } //for
    } //for

    //ページ取得
    var strTmpBody = glObjRedBody.innerHTML;
    var arrTmpPages = strTmpBody.split('class="awdiv awpage"') //pageクラス

    for (let i = 0; i < glArrBfIds.length; i++) {
        for (let j = 0; j < arrTmpPages.length; j++) {
            if (arrTmpPages[j].indexOf(glArrBfIds[i]) >= 0) {
                pages[i] = j;
                break;
            } //if
        } //for
    } //for

    //※ソートについて
    //　・テキスト、Word・・・第1ソート：ページ・スライド、第2ソート：htmlの登場順
    //　・Excel/PowerPoint/PDF・・・第1ソート：ページ・スライド、第2ソート：単語登場順、第3ソート：図表のhtml登場順
    // 
    //○実装
    //第1ソート、第2ソートは同ロジック
    //第3ソートはObject要素を集めて各ページの最後に入れ込む

    //第1ソート：ページ・スライド 第2ソート：htmlの登場順
    var objTgtFlame = document.getElementById("red").contentDocument;
    var objInitList = objTgtFlame.getElementsByClassName('tagRedInit');
    for (let i = 0; i < objInitList.length; i++) {
    	var intIndex=glArrBfIds.indexOf(objInitList[i].id);
    	tmpKeyWords[i] = keywords[intIndex];
    	tmpPages[i] = pages[intIndex];
    	tmpPolicyNames[i] = policyNames[intIndex];
    	tmpReasons[i] = Reasons[intIndex];
    	tmpRemarks[i] = glRemarks[intIndex];
    	tmpArrBfIds[i] = glArrBfIds[intIndex];
    	tmpArrAfIds[i] = glArrAfIds[intIndex];
    	tmpArrPolicys[i] = glArrPolicys[intIndex];
        tmpArrRepOuter[i] = glArrRepOuter[intIndex];

        //20200114 badge対応
        var strBadgeId='bdg'+tmpArrBfIds[i].substr(3,tmpArrBfIds[i].length);
        var objBadge = glObjRedFlame.getElementById(strBadgeId);
        tmpBadges[i] = objBadge.innerText;


    } //for

    //第3ソート用にObject要素を集める
    var tmpObjKeyWords = [];
    var tmpObjPages = [];
    var tmpObjPolicyNames = [];
    var tmpObjReasons = [];
    var tmpObjRemarks = [];
    var tmpObjArrBfIds = [];
    var tmpObjArrAfIds = [];
    var tmpObjArrPolicys = [];
    var tmpObjArrRepOuter = [];
                        
     if (objectIds.length > 0) {
        for (let idx = 0; idx < glObjRedInDocs.length; idx++) {
            var objTgtTag = glObjRedInDocs[idx].getSVGDocument();
            var objInitList = null;
            try {
                objInitList = objTgtTag.getElementsByClassName(RED_INIT_CLS)
            } catch (error) {
                console.log("対象" + idx + "objectタグに黒塗り箇所は有りません");
            } //try
            if (objInitList.length > 0) {
                for (let i = 0; i < objInitList.length; i++) {
                    // if (objInitList[i].id.indexOf('rct') !== -1) {//image
                    //     continue;
                    // }
                    var intIndex = glArrBfIds.indexOf(objInitList[i].id);
                    tmpObjKeyWords[intIndex] = keywords[intIndex];
                    tmpObjPages[intIndex] = pages[intIndex];
                    tmpObjPolicyNames[intIndex] = policyNames[intIndex];
                    tmpObjReasons[intIndex] = Reasons[intIndex];
                    tmpObjRemarks[intIndex] = glRemarks[intIndex];
                    tmpObjArrBfIds[intIndex] = glArrBfIds[intIndex];
                    tmpObjArrAfIds[intIndex] = glArrAfIds[intIndex];
                    tmpObjArrPolicys[intIndex] = glArrPolicys[intIndex];
                    tmpObjArrRepOuter[intIndex] = glArrRepOuter[intIndex];

                    //20200114 badge対応
                    var strBadgeId = 'bdg' + tmpObjArrBfIds[intIndex].substr(3, tmpObjArrBfIds[intIndex].length);
                    var objBadge = glObjRedFlame.getElementById(strBadgeId);
                    tmpObjBadges[intIndex] = objBadge.innerText;
                } //for
            } //if
        } //for
        
    } //if

    //objectタグの要素をページの最後に入れ込む
    if (objectIds.length > 0) {
        //最初は1ページ目
        var intBfPage = 1;

        for (let i = 0; i < tmpPages.length; i++) {
            var intActPage = tmpPages[i];
            if(intBfPage!==intActPage){

                intBfPage=intActPage;
            } //if
            
        } //for

    } //if


    keywords=tmpKeyWords;
    pages=tmpPages;
    policyNames=tmpPolicyNames;
    Reasons=tmpReasons;
    glRemarks=tmpRemarks;
    glArrBfIds=tmpArrBfIds;
    glArrAfIds=tmpArrAfIds;
    glArrPolicys=tmpArrPolicys;
    glArrRepOuter=tmpArrRepOuter;




    //クラスをインスタンス化して配列格納、JSONにして送付
    objListInfo = new listInfoCls();
    objListInfo.keywords = keywords;
    objListInfo.pages = pages;
    objListInfo.policyNames = policyNames;
    objListInfo.Reasons = Reasons;
    objListInfo.Remarks = glRemarks; //黒塗り備考 初期に送るときは空の配列

    //20191107 add
    objListInfo.glArrBfIds = glArrBfIds; //黒塗り先頭ID
    objListInfo.glArrAfIds = glArrAfIds; //黒塗り終了ID
    objListInfo.glArrPolicys = glArrPolicys; //黒塗り対象のIDに紐づくポリシーID
    objListInfo.glArrRepOuter = glArrRepOuter; //黒塗り候補変更後のOuterHtml

    //20200114 badge対応
    objListInfo.pageBadge = tmpBadges; //黒塗り対象のbadge

    // 20200310 FileId
    objListInfo.glIntFileId = [glIntFileId];

    var strJson = JSON.stringify(objListInfo);
    return strJson;
} //makeMaskJson

// async function makeMaskJson() {
//     //黒塗りリスト表示画面に送付する配列を作成
//     var keywords = []; //黒塗り単語の配列
//     var pages = [];  //登場箇所の配列
//     var policyNames = []; //ポリシー名の配列
//     var Reasons = []; //黒塗り対処理由の配列
//     var Remarks = []; //黒塗り対処理由の配列

//     //黒塗りリスト表示画面に送付する配列を作成
//     var tmpKeyWords = []; //黒塗り単語の配列
//     var tmpPages = [];  //登場箇所の配列
//     var tmpPolicyNames = []; //ポリシー名の配列
//     var tmpReasons = []; //黒塗り対処理由の配列
//     var tmpRemarks = []; //黒塗り対処理由の配列
//     var tmpArrBfIds = [];
//     var tmpArrAfIds = [];
//     var tmpArrPolicys = [];
//     var tmpArrRepOuter = [];
//     //20200114 badge対応
//     var tmpBadges = [];
//     //20200220
//     var objectIds = []; //objectの場合idを保持しておく

//     // badgeを非表示のドキュメントの場合ここで番号を計算する
//     if (glBadgeDisabledFlag) {
//         makeMaskBadge();
//         //念の為object埋め込み
//         await exchangeObjectElement();
//     }  //if

//     //黒塗り単語の配列 ポリシー名の配列 黒塗り対処理由の配列作成
//     for (let i = 0; i < glArrPolicys.length; i++) {
//         for (let j = 0; j < glPolicyLists.length; j++) {
//             var intDiffPolicy = Number(glPolicyLists[j].policyId);
//             if (glArrPolicys[i] === intDiffPolicy) {
//                 policyNames[i] = glPolicyLists[j].policyName;
//                 Reasons[i] = glPolicyLists[j].policyReason;
//                 if (glRemarks[i] == null) {
//                     Remarks[i] = glRemarks[i] || "";
//                 } else {
//                     Remarks[i] = glRemarks[i];
//                 } //if
//                 var redId = glArrBfIds[i];
//                 // 対象のidがobject内ではない時
//                 var objChkDom = glObjRedFlame.getElementById(glArrBfIds[i]);
//                 if (objChkDom !== null) {
//                     // if (!glObjRedBfSvgOuterHtml[redId]) {
//                     //キーワード取得
//                     var intBfPos = glObjRedBody.innerHTML.indexOf(glObjRedFlame.getElementById(glArrBfIds[i]).outerHTML);
//                     var intAfPos = glObjRedBody.innerHTML.indexOf(glObjRedFlame.getElementById(glArrAfIds[i]).outerHTML) + glObjRedFlame.getElementById(glArrAfIds[i]).outerHTML.length;
//                     var strTmp = glObjRedBody.innerHTML.substring(intBfPos, intAfPos); //対象のアウター
//                     //innerTextを取得するため、tmpの親を作成し、OuterHTMLを埋め込む
//                     var objTmpParent = $('<div></div>').append(strTmp);
//                     keywords[i] = objTmpParent[0].innerText;
//                 } else {
//                     keywords[i] = "";
//                     objectIds.push(redId);
//                 } //if
//             } //if
//         } //for
//     } //for

//     //ページ取得
//     var strTmpBody = glObjRedBody.innerHTML;
//     var arrTmpPages = strTmpBody.split('class="awdiv awpage"') //pageクラス
//     for (let i = 0; i < glArrBfIds.length; i++) {
//         for (let j = 0; j < arrTmpPages.length; j++) {
//             if (objectIds.indexOf(glArrBfIds[i]) >= 0) {
//                 var strObjRedId = "";
//                 for (var k = 0; k < objectIds.length; k++) {
//                     if (objectIds[k] == glArrBfIds[i]) {
//                         // objectタグのidを調べる
//                         for (var idx = 0; idx < glObjRedInDocs.length; idx++) {
//                             var strSvgRedId = glObjRedInDocs[idx].contentDocument.documentElement.getElementById(glArrBfIds[i]);
//                             if (strSvgRedId) {
//                                 strObjRedId = glObjRedInDocs[idx].id;
//                                 break;
//                             }//if
//                         }//for
//                     } //if
//                 } //for
//                 if (arrTmpPages[j].indexOf(strObjRedId) >= 0) {
//                     pages[i] = j;
//                     break;
//                 }// if
//             } else if (arrTmpPages[j].indexOf(glArrBfIds[i]) >= 0) {
//                 pages[i] = j;
//                 break;
//             } //if
//         } //for
//     } //for

//     var objTgtFlame = document.getElementById("red").contentDocument;
//     var objInitList = objTgtFlame.getElementsByClassName(RED_INIT_CLS);
//     var intCnt = 0;
//     for (let i = 0; i < objInitList.length; i++) {
//         var intIndex = glArrBfIds.indexOf(objInitList[i].id);
//         tmpKeyWords[i] = keywords[intIndex];
//         tmpPages[i] = pages[intIndex];
//         tmpPolicyNames[i] = policyNames[intIndex];
//         tmpReasons[i] = Reasons[intIndex];
//         tmpRemarks[i] = glRemarks[intIndex];
//         tmpArrBfIds[i] = glArrBfIds[intIndex];
//         tmpArrAfIds[i] = glArrAfIds[intIndex];
//         tmpArrPolicys[i] = glArrPolicys[intIndex];
//         tmpArrRepOuter[i] = glArrRepOuter[intIndex];

//         //20200114 badge対応
//         var strBadgeId = 'bdg' + tmpArrBfIds[i].substr(3, tmpArrBfIds[i].length);
//         var objBadge = glObjRedFlame.getElementById(strBadgeId);
//         tmpBadges[i] = objBadge.innerText;
//         intCnt++;
//     } //for

//     // //20200221
//     if (objectIds.length > 0) {
//         for (let idx = 0; idx < glObjRedInDocs.length; idx++) {
//             var objTgtTag = glObjRedInDocs[idx].getSVGDocument();
//             // var objInitList = objTgtTag.getElementsByClassName(RED_INIT_CLS);
//             var objInitList = null;
//             try {
//                 objInitList = objTgtTag.getElementsByClassName(RED_INIT_CLS)
//             } catch (error) {
//                 console.log("対象" + idx + "objectタグに黒塗り箇所は有りません");
//             } //try
//             if (objInitList.length > 0) {
//                 for (let i = 0; i < objInitList.length; i++) {
//                     if (objInitList[i].id.indexOf('rct') !== -1) {//image
//                         continue;
//                     }
//                     var intIndex = glArrBfIds.indexOf(objInitList[i].id);
//                     tmpKeyWords[intCnt] = keywords[intIndex];
//                     tmpPages[intCnt] = pages[intIndex];
//                     tmpPolicyNames[intCnt] = policyNames[intIndex];
//                     tmpReasons[intCnt] = Reasons[intIndex];
//                     tmpRemarks[intCnt] = glRemarks[intIndex];
//                     tmpArrBfIds[intCnt] = glArrBfIds[intIndex];
//                     tmpArrAfIds[intCnt] = glArrAfIds[intIndex];
//                     tmpArrPolicys[intCnt] = glArrPolicys[intIndex];
//                     tmpArrRepOuter[intCnt] = glArrRepOuter[intIndex];

//                     //20200114 badge対応
//                     var strBadgeId = 'bdg' + tmpArrBfIds[intCnt].substr(3, tmpArrBfIds[intCnt].length);
//                     var objBadge = glObjRedFlame.getElementById(strBadgeId);
//                     tmpBadges[intCnt] = objBadge.innerText;
//                     intCnt++;
//                 } //for
//             } //if
//         } //for
//     } //if

//     //20200310 object化してソートしなおす
//     test=[];
//     for (let i = 0; i < tmpKeyWords.length; i++) {
//         tmpHash = {};
//         tmpHash.tmpKeyWords=tmpKeyWords[i]
//         tmpHash.tmpPages=tmpPages[i]
//         tmpHash.tmpPolicyNames=tmpPolicyNames[i]
//         tmpHash.tmpReasons=tmpReasons[i]
//         tmpHash.tmpRemarks=tmpRemarks[i]
//         tmpHash.tmpArrBfIds=tmpArrBfIds[i]
//         tmpHash.tmpArrAfIds=tmpArrAfIds[i]
//         tmpHash.tmpArrPolicys=tmpArrPolicys[i]
//         tmpHash.tmpArrRepOuter=tmpArrRepOuter[i]
//         test.push(tmpHash)
//     } //for

//     test.sort(function(a, b) {
//         //第一ソート、page
//       if (a.tmpPages > b.tmpPages) return 1;
//       if (a.tmpPages < b.tmpPages) return -1;

//       //第二ソートの単語登場順は行っているので第三ソート,policy_type
//       if (a.tmpArrPolicys > b.tmpArrPolicys) return -1;
//       if (a.tmpArrPolicys < b.tmpArrPolicys) return 1;

//     })


//     keywords = tmpKeyWords;
//     pages = tmpPages;
//     policyNames = tmpPolicyNames;
//     Reasons = tmpReasons;
//     glRemarks = tmpRemarks;
//     glArrBfIds = tmpArrBfIds;
//     glArrAfIds = tmpArrAfIds;
//     glArrPolicys = tmpArrPolicys;
//     glArrRepOuter = tmpArrRepOuter;


//     //クラスをインスタンス化して配列格納、jaonにして送付
//     objListInfo = new listInfoCls();
//     objListInfo.keywords = keywords;
//     objListInfo.pages = pages;
//     objListInfo.policyNames = policyNames;
//     objListInfo.Reasons = Reasons;
//     objListInfo.Remarks = glRemarks; //黒塗り備考 初期に送るときは空の配列

//     //20191107 add
//     objListInfo.glArrBfIds = glArrBfIds; //黒塗り先頭ID
//     objListInfo.glArrAfIds = glArrAfIds; //黒塗り終了ID
//     objListInfo.glArrPolicys = glArrPolicys; //黒塗り対象のIDに紐づくポリシーID
//     objListInfo.glArrRepOuter = glArrRepOuter; //黒塗り候補変更後のOuterHtml

//     //20200114 badge対応
//     objListInfo.pageBadge = tmpBadges; //黒塗り対象のbadge

//     // 20200310 FileId
//     objListInfo.glIntFileId = [glIntFileId];
    
//     var strJson = JSON.stringify(objListInfo);
//     return strJson;
// } //makeMaskJson

/**
 * 黒塗りリストを表示する
 * @function
 */
async function maskListView() {

    var blRet = confirm("「一時保存」後に「黒塗りリスト」を表示しないと編集内容が復元できません。\r\n「一時保存」を行って「黒塗りリスト」を表示してよろしいですか?");
    if (blRet) {

        var strJson = await makeMaskJson();

        //一時保存処理
        saveTmpDocDelMain(1);
        if (!glTmpSaveDelFlg) {
            alert('画面遷移前の一時保存削除処理に失敗しました。\r\n一度検索画面に戻り、「再開」ボタンで再開してください。');
            return;
        } //if
        saveTmpDocMain(1);
        if (!glTmpSaveFlg) {
            alert('画面遷移前の一時保存処理に失敗しました。\r\n一度検索画面に戻り、「再開」ボタンで再開してください。');
            return;
        } //if

        var objForm = document.createElement('form');
        var objReq1 = document.createElement('input');
        var objReq2 = document.createElement('input');
        var objReq3 = document.createElement('input');
        var objReq4 = document.createElement('input');
        var objReq5 = document.createElement('input');
        var objReq6 = document.createElement('input');

        objForm.method = 'POST';
        objForm.action = "MaskListCnt";
        // objForm.target = 'maskList';

        objReq1.type = 'hidden'; //入力フォームが表示されないように
        objReq1.name = 'blackPaintList';
        objReq1.value = strJson;

        objReq2.type = 'hidden'; //入力フォームが表示されないように
        objReq2.name = 'tmpDir';
        objReq2.value = glStrTmpDir;

        objReq3.type = 'hidden'; //入力フォームが表示されないように
        objReq3.name = 'strFileName';
        objReq3.value = glFileName;

        objReq4.type = 'hidden'; //入力フォームが表示されないように
        objReq4.name = 'documentId';
        objReq4.value = glDocumentId;

        objReq5.type = 'hidden'; //入力フォームが表示されないように
        objReq5.name = 'intPageCnt';
        objReq5.value = PAGE_COUNT;

        objReq6.type = 'hidden'; //入力フォームが表示されないように
        objReq6.name = 'strFilePath';
        objReq6.value = glFilePath;



        objForm.appendChild(objReq1);
        objForm.appendChild(objReq2);
        objForm.appendChild(objReq3);
        objForm.appendChild(objReq4);
        objForm.appendChild(objReq5);
        objForm.appendChild(objReq6);

        document.body.appendChild(objForm);
        //POST送信フラグを「true」に設定
        $("#top").select();
        isPost = true;
        objForm.submit();


    } //if



} //function


/**
 * 文書保存画面を表示する
 * @function
 */
async function saveMaskProvMask() {

    var blRet = confirm("「一時保存」後に「黒塗り文書保存画面」を表示しないと編集内容が復元できません。\r\n「一時保存」を行って「黒塗り文書保存画面」を表示してよろしいですか?");
    if (blRet) {
        var strJson = await makeMaskJson();

        //一時保存処理
        saveTmpDocDelMain(1);
        if (!glTmpSaveDelFlg) {
            alert('画面遷移前の一時保存削除処理に失敗しました。\r\n一度検索画面に戻り、「再開」ボタンで再開してください。');
            return;
        } //if
        saveTmpDocMain(1);
        if (!glTmpSaveFlg) {
            alert('画面遷移前の一時保存処理に失敗しました。\r\n一度検索画面に戻り、「再開」ボタンで再開してください。');
            return;
        } //if

        var strMaskHtml = glObjMaskFlame.body.outerHTML;
        var strRedHtml = glObjRedFlame.body.outerHTML;

        //別ウィンドウで表示
        // window.open("about:blank","SaveProvMaskCnt","width=1500,height=1000,scrollbars=yes"); arrdocumentId

        var objForm = document.createElement('form');
        var objReq = document.createElement('input');
        var objReq2 = document.createElement('input');
        var objReq3 = document.createElement('input');
        var objReq4 = document.createElement('input');
        var objReq5 = document.createElement('input');
        var objReq6 = document.createElement('input');
        var objReq7 = document.createElement('input');



        objForm.method = 'POST';
        objForm.action = "SaveProvMaskCnt";
        // objForm.target = 'SaveProvMaskCnt';

        objReq.type = 'hidden'; //入力フォームが表示されないように
        objReq.name = 'tmpDir';
        objReq.value = glStrTmpDir;

        objReq2.type = 'hidden'; //入力フォームが表示されないように
        objReq2.name = 'strRedHtml';
        objReq2.value = strRedHtml;

        objReq3.type = 'hidden'; //入力フォームが表示されないように
        objReq3.name = 'strMaskHtml';
        objReq3.value = strMaskHtml;

        objReq4.type = 'hidden'; //入力フォームが表示されないように
        objReq4.name = 'listJson';
        objReq4.value = strJson;

        objReq5.type = 'hidden'; //入力フォームが表示されないように
        objReq5.name = 'strFileName';
        objReq5.value = glFileName;

        objReq6.type = 'hidden'; //入力フォームが表示されないように
        objReq6.name = 'documentId';
        objReq6.value = glDocumentId;

        objReq7.type = 'hidden'; //入力フォームが表示されないように
        objReq7.name = 'strFilePath';
        objReq7.value = glFilePath;


        objForm.appendChild(objReq);
        objForm.appendChild(objReq2);
        objForm.appendChild(objReq3);
        objForm.appendChild(objReq4);
        objForm.appendChild(objReq5);
        objForm.appendChild(objReq6);
        objForm.appendChild(objReq7);
        document.body.appendChild(objForm);

        //POST送信フラグを「true」に設定
        $("#top").select();
        isPost = true;

        objForm.submit();
    }

} //function



/**
 * 次のページへページネーションする
 * @function
 */
function pageNext() {
    if (Number(glIntPageAct) !== Number((PAGE_COUNT) - 1) * Number(PAGE_PX)) {
        repDiv.scrollTo(0, Number(glIntPageAct) + Number(PAGE_PX));
        glIntPageAct += Number(PAGE_PX);
        var intPages = glIntPageAct / Number(PAGE_PX) + 1;
        document.getElementsByClassName('pageNate0')[0].value = "" + intPages;
        document.getElementsByClassName('pageNate1')[0].value = "" + intPages;
    } //if
} //functon

/**
 * 前のページへページネーションする
 * @function
 */
function pageBack() {
    if (Number(glIntPageAct) !== 0) {
        repDiv.scrollTo(0, Number(glIntPageAct) - Number(PAGE_PX));
        glIntPageAct -= Number(PAGE_PX);
        var intPages = glIntPageAct / Number(PAGE_PX) + 1;
        document.getElementsByClassName('pageNate0')[0].value = intPages;
        document.getElementsByClassName('pageNate1')[0].value = intPages;
    } //if
} //functon

/**
 * 指定したページへページネーションする
 * @function
 * @param {Number} intTgtPage_i ページ番号
 */
function pageSelect(intTgtPage_i) {
    repDiv.scrollTo(0, PAGE_PX * intTgtPage_i);
    glIntPageAct += PAGE_PX * intTgtPage_i;
} //functon

/**
 * 最初のページへページネーションする
 * @function
 */
function pageInit() {
    repDiv.scrollTo(0, 0);
    glIntPageAct = 0;
} //functon

/**
 * 最後のページへページネーションする
 * @function
 */
function pageEnd() {
    repDiv.scrollTo(0, (PAGE_PX * (PAGE_COUNT - 1)));
    glIntPageAct = PAGE_PX * (PAGE_COUNT - 1);
} //functon

/**
 * 選択範囲のouterHTMLを取得する(修正版)
 * @function
 * @returns {String} 選択範囲のouterHTML
 */
function getSelectionHtml() {
    var html = "";
    var sel = glObjRedFlame.getSelection();
    if (sel.rangeCount) {
        var container = document.createElement("div");
        for (var i = 0, len = sel.rangeCount; i < len; ++i) {
            container.appendChild(sel.getRangeAt(i).cloneContents());
        } //for
        html = container.innerHTML;
        if (glSelectInitId !== glSelectEndId) {
            var strReg = '^.+' + glSelectInitId + '"\>';
            var objPattern = new RegExp(strReg, "gi");
            html = html.replace(objPattern, '');

            strReg = glSelectEndId + '">(.+)';
            objPattern = new RegExp(strReg, "gi");
            var arrTmp = html.match(objPattern, '');
            var strTmp = arrTmp[0].replace(glSelectEndId + '">', '')

            strReg = '\<.*';
            objPattern = new RegExp(strReg, "gi");
            strTmp = strTmp.replace(objPattern, '');

            strReg = strTmp + '.*';
            objPattern = new RegExp(strReg, "gi");
            html = html.replace(objPattern, strTmp);
        } //if
    } //if

    return html;
} //function

/**
 * 左側のテキストボックスに入力したページへページネーションする
 * @function
 */
function enter0() {
    if (event.keyCode !== 13) { // Enterキー除外
        return false;
    }
    var arrPages = document.getElementsByClassName('pageNate0');
    var intPage = Number(arrPages[0].value) - 1;
    if ((intPage !== undefined) && (intPage !== -1) && (intPage < PAGE_COUNT) && (intPage >= 0)) {
        pageSelect(intPage);
        var intPages = intPage + 1;
        document.getElementsByClassName('pageNate1')[0].value = "" + intPages;

        glIntPageAct = intPage * Number(PAGE_PX);

    } //if
} //function

/**
 * 右側のテキストボックスに入力したページへページネーションする
 * @function
 */
function enter1() {
    if (event.keyCode !== 13) { // Enterキー除外
        return false;
    }
    var arrPages = document.getElementsByClassName('pageNate1');
    var intPage = Number(arrPages[0].value) - 1;
    if ((intPage !== undefined) && (intPage !== -1) && (intPage < PAGE_COUNT) && (intPage >= 0)) {
        pageSelect(intPage);
        var intPages = intPage + 1;
        document.getElementsByClassName('pageNate0')[0].value = intPages;
        glIntPageAct = intPage * Number(PAGE_PX);
    } //if
} //function

/**
 * 「一時保存」ボタン押下処理
 * @function
 */
function saveTmpDoc() {

    if (glTmpFileFlg) {
        var blRet = confirm("すでに一時保存データがありますが上書きしますか？"); //処理確認
        if (blRet) {
            saveTmpDocDelMain(1); //Delete → Insert
            saveTmpDocMain(0);
        } //if
    } else {
        var blRet = confirm("一時保存を行いますか？"); //処理確認
        if (blRet) {
            saveTmpDocMain(0);
        } //if
    } //if


    return;
} //function

/**
 * 「一時保存」ボタン押下処理メイン
 * ※glTmpSaveFlgに成否格納 true 成功 false 失敗
 * @function
 * @param {Number} status メッセージ表示status 0:表示 1 非表示
 */
function saveTmpDocMain(status) {

    $("#top").select();
    var strMaskHtml = glObjMaskFlame.body.outerHTML;
    var strRedHtml = glObjRedFlame.body.outerHTML;
    var arrTmpDir = [glStrTmpDir];
    var arrStrRedHtml = [strRedHtml];
    var arrStrMaskHtml = [strMaskHtml];
    var arrStrFileName = [glFileName];
    var arrdocumentId = [glDocumentId];

    //hashを作成してjsonで送付
    var HashJson = {
        'tmpDir': arrTmpDir,
        'strRedHtml': arrStrRedHtml,
        'strMaskHtml': arrStrMaskHtml,
        'strFileName': arrStrFileName,
        'documentId': arrdocumentId,
        'glArrBfIds': glArrBfIds,
        'glArrAfIds': glArrAfIds,
        'glArrPolicys': glArrPolicys,
        'glRemarks': glRemarks
    };

    //一時保存
    $.ajax({
        type: 'POST',
        url: 'blackpaint/SaveTmpDocCnt',
        data: '[' + JSON.stringify(HashJson) + ']', //連想配列をJSONに変換
        dataType: "json",
        processData: false, // Ajaxがdataを整形しない指定
        contentType: false, // contentTypeもfalseに指定(Fileをアップロード時は必要)
        async: false, //非同期false
        success: function (retData) {
            console.log("success");
            //btnFlg処理
            glTmpFileFlg = true;
            tmpBtnStateRemove();
            if (status === 0) {
                alert("一時保存しました。");
            } //if
            glTmpSaveFlg = true;
            return false;
        }, //function
        error: function (e) {
            console.log("fail");
            if (status === 0) {
                alert("一時保存に失敗しました。")
            } //if
            glTmpSaveFlg = false;
            return false;
        } //function
    }); //ajax

} //saveTmpDoc

/**
 * 「一時保存再開」ボタン押下処理
 * @function
 */
function SaveTmpReopen() {
    var blRet = false;
    blRet = isTmpBtn();
    if (blRet) {
        return;
    } //if

    blRet = confirm("一時保存していたデータを再開しますか？"); //処理確認
    if (blRet) {
        SaveTmpReopenMain(0);
    } //if
    return;
} //function

/**
 * 「一時保存再開」ボタン押下処理Main
 * @function
 * @param {Number} status メッセージ表示status 0:表示 1 非表示
 */
async function SaveTmpReopenMain(status) {
    //iframeが呼ばれるまでloopSleepをループ
    var blRet = false;
    await loopSleep(50, 100, function (i) {
        if (blRet) {
            // breakと同等
            console.log("waitIframe Success");
            return false;
        } //if
        blRet = waitIframe();
    });

    $("#top").select();
    $.ajax({
        type: 'POST',
        url: 'blackpaint/SaveTmpReopen',
        data: glDocumentId,
        dataType: "json",
        processData: false, // Ajaxがdataを整形しない指定
        contentType: false, // contentTypeもfalseに指定(Fileをアップロード時は必要)
        async: false, //非同期false
        success: function (retData) {
            console.log("success");
            //iframe再読み込み
            $(document).ready(function () {
                $('#red').each(function () {
                    this.contentWindow.location.reload(true);
                });
            });
            $(document).ready(function () {
                $('#mask').each(function () {
                    this.contentWindow.location.reload(true);
                });
            });
            $("#top").select();
            if (status === 0) {
                alert("一時保存していたデータを再開します");
                blRet = false;
                document.getElementById('AI_Policy').innerHTML = "-";
                $('#POLICY_SENTAKU').addClass(BTN_DISABLE);
            } //if

            //gl変数初期化
            glArrBfIds = []; //黒塗り先頭ID
            glArrAfIds = []; //黒塗り終了ID
            glArrPolicys = []; //黒塗り対象のIDに紐づくポリシーID
            glArrRepOuter = []; //黒塗り候補変更後のOuterHtml
            glRemarks = []; //黒塗りリストの備考
            for (let i = 0; i < retData.length; i++) {
                glArrBfIds[i] = retData[i].markerStartCd;
                glArrAfIds[i] = retData[i].markerEndCd;
                glArrPolicys[i] = retData[i].markerPolicy;
                glRemarks[i] = retData[i].markerRemarks;
            } //for

            //マスク候補とマスクの初期処理一部を走らせる
            $('#red').on('load', function () {

                $('#mask').on('load', function () {
                    glObjMaskFlame = document.getElementById("mask").contentDocument;
                    glObjMaskBody = glObjMaskFlame.body;
                    glObjRedFlame = document.getElementById("red").contentDocument;
                    glObjRedBody = glObjRedFlame.body;
                    //Event追加
                    //コンテキストメニュー
                    glObjRedBody.oncontextmenu = function () { //デフォルト無効
                        return false;
                    };
                    glObjRedBody.addEventListener("mousedown", mouseDownAct, false);
                    glObjRedBody.addEventListener('mouseup', mouseUpAct, false);
                    glObjRedBody.addEventListener('contextmenu', contextFunc, false);
                    //黒塗り箇所範囲選択用のOuterHtmlを作成する
                    makeMaskOuter();
                    var blRet = false;
                    loopSleep(50, 100, function (i) {
                        if (blRet) {
                            // breakと同等
                            console.log("waitIframe Success");
                            return false;
                        } //if
                        blRet = waitIframe();
                    });
                    //20200305 イベント追加
                    exchangeObjectElement();
                });// function
            });// function


            // //20200302 IDの再採番をメソッド化
            getLastId();

            return false;
        }, //function
        error: function (e) {
            console.log("fail");
            return false;
        } //function
    }); //ajax

} //SaveTmpReopen

/**
 * 他画面からCancel動作で画面遷移した際呼び込む関数
 * @param {Number} status メッセージ表示status 0:表示 1 非表示
 */
/**
 * 他画面からCancel動作で画面遷移した際呼び込む関数
 * @param {Number} status メッセージ表示status 0:表示 1 非表示
 */
function CancelBack(status) {

    $("#top").select();
    $.ajax({
        type: 'POST',
        url: 'blackpaint/SaveTmpReopen',
        data: glDocumentId,
        dataType: "json",
        processData: false, // Ajaxがdataを整形しない指定
        contentType: false, // contentTypeもfalseに指定(Fileをアップロード時は必要)
        async: false, //非同期false
        success: function (retData) {
            console.log("success");
            //iframe再読み込み
            $(document).ready(function () {
                $('#red').each(function () {
                    this.contentWindow.location.reload(true);
                });
            });
            $(document).ready(function () {
                $('#mask').each(function () {
                    this.contentWindow.location.reload(true);
                });
            });
            $("#top").select();
            if (status === 0) {
                alert("一時保存していたデータを再開します");
            } //if

            //bootOpenとおるのでglEditMarkerをつくる必要
            glEditMarker = "";
            for (let i = 0; i < retData.length; i++) {
                glEditMarker += retData[i].markerStartCd + ":";
                glEditMarker += retData[i].markerEndCd + ":";
                glEditMarker += retData[i].markerPolicy + "+";
                //glRemarksはつくっておく
                glRemarks[i] = retData[i].markerRemarks;
            } //for
            glEditMarker = glEditMarker.substr(0, glEditMarker.length - 1);

            return false;
        }, //function
        error: function (e) {
            console.log("fail");
            return false;
        } //function
    }); //ajax

} //function


/**
 * 黒塗りリスト画面で「確定」ボタン押下した際呼び込む関数
 * @function
 * @param {JSON} glBlackPaintList json配列
 */
function confirmBack(glBlackPaintList) {

    //gl変数初期化(備考のみ)
    glRemarks = glBlackPaintList.Remarks; //黒塗りリストの備考

} //function

/**
 * 「一時保存削除」ボタン押下処理
 * @function
 */
function saveTmpDocDel() {

    var blRet = false;
    blRet = isTmpBtn();
    if (blRet) {
        return;
    } //if

    blRet = confirm("一時保存削除を行いますか？"); //処理確認
    if (blRet) {
        saveTmpDocDelMain(0);
    } //if
    return;
} //function


/**
 * 「一時保存削除」ボタン押下処理メイン
 * ※glTmpSaveDelFlgに成否格納 true 成功 false 失敗
 * @function
 * @param {Number} status メッセージ表示status 0:表示 1 非表示
 */
function saveTmpDocDelMain(status) {

    $("#top").select();
    var arrdocumentId = [glDocumentId];
    //hashを作成してjsonで送付
    let HashJson = {
        'documentId': arrdocumentId
    };

    glTmpSaveDelFlg = false;

    $.ajax({
        type: 'POST',
        url: 'blackpaint/SaveTmpDelDocCnt',
        data: '[' + JSON.stringify(HashJson) + ']', //連想配列をJSONに変換
        dataType: "json",
        processData: false, // Ajaxがdataを整形しない指定
        contentType: false, // contentTypeもfalseに指定(Fileをアップロード時は必要)
        async: false, //非同期false
        success: function (retData) {
            //btnFlg処理
            glTmpSaveDelFlg = false;
            tmpBtnStateCng();
            console.log("success");
            if (status === 0) {
                alert("一時保存削除しました。")
            } //if
            glTmpSaveDelFlg = true;
            return false;
        }, //function
        error: function (e) {
            console.log("fail");
            if (status === 0) {
                alert("一時保存削除に失敗しました。");
            }//if
            glTmpSaveDelFlg = false;
            return false;
        } //function
    }); //ajax

} //function

/**
 * 「一時保存」にデータが保存されているか確認する
 * ※glTmpFileFlgに成否格納 true 保存されている false 保存されていない
 * @function
 */
function TmpInfoGet() {

    $("#top").select();
    var blRet = false;
    //hashを作成してjsonで送付
    let HashJson = {
        'documentId': glDocumentId
    };

    $.ajax({
        type: 'POST',
        url: 'blackpaint/rest/tmpinfo',
        data: '[' + JSON.stringify(HashJson) + ']', //連想配列をJSONに変換
        dataType: "json",
        processData: false, // Ajaxがdataを整形しない指定
        contentType: false, // contentTypeもfalseに指定(Fileをアップロード時は必要)
        async: false, //非同期false
        success: function (retData) {
            console.log("success");
            var objJson = JSON.parse(retData);
            blRet = Boolean(objJson);
            glTmpFileFlg = blRet; //returnがうまくいかないのでGL変数に格納
        }, //function
        error: function (e) {
            console.log("fail");
            glTmpFileFlg = false;
            // return false;
        } //function
    }); //ajax
    // return blRet;
} //function

/**
 * 次のページへページネーションする
 * @function
 */
function pageRefNext() {
    if (Number(glIntPageRefAct) !== Number((REFPAGE_COUNT) - 1) * Number(REFPAGE_PX)) {
        refDiv.scrollTo(0, Number(glIntPageRefAct) + Number(REFPAGE_PX));
        glIntPageRefAct += Number(REFPAGE_PX);
        var intPages = glIntPageRefAct / Number(REFPAGE_PX) + 1;
        document.getElementsByClassName('pageNateRef')[0].value = "" + intPages;
    } //if
} //functon

/**
 * 前のページへページネーションする
 * @function
 */
function pageRefBack() {
    if (Number(glIntPageRefAct) !== 0) {
        refDiv.scrollTo(0, Number(glIntPageRefAct) - Number(REFPAGE_PX));
        glIntPageRefAct -= Number(REFPAGE_PX);
        var intPages = glIntPageRefAct / Number(REFPAGE_PX) + 1;
        document.getElementsByClassName('pageNateRef')[0].value = intPages;
    } //if
} //functon

/**
 * 指定したページへページネーションする
 * @function
 * @param {Number} intTgtPage_i ページ番号
 */
function pageRefSelect(intTgtPage_i) {
    refDiv.scrollTo(0, REFPAGE_PX * intTgtPage_i);
    glIntPageRefAct += REFPAGE_PX * intTgtPage_i;
} //functon


/**
 * 右側のテキストボックスに入力したページへページネーションする
 * @function
 */
function enterRef() {
    if (event.keyCode !== 13) { // Enterキー除外
        return false;
    }
    var arrPages = document.getElementsByClassName('pageNateRef');
    var intPage = Number(arrPages[0].value) - 1;
    if ((intPage !== undefined) && (intPage !== -1) && (intPage < REFPAGE_COUNT) && (intPage >= 0)) {
        pageRefSelect(intPage);
        glIntPageRefAct = intPage * Number(REFPAGE_PX);
    } //if
} //function

/**
 * 図・表をマスクする
 * @function
 * @param {Event} e イベント
 */
async function changeMaskImg() {
    //黒塗り候補側処理
    var strTgtID = glSelectEndId;
    var objRedTgt = glObjRedFlame.getElementById(strTgtID);
    //図表がリストに表示されない修正
    objRedTgt.classList.add(RED_INIT_CLS);
    objRedTgt.classList.add(RED_IMG);
    // var intRedImgClsLen = RED_IMG.length; //クラス分の長さを覚えておく
    var intRedImgClsLen = RED_IMG.length + RED_INIT_CLS.length + 1; //クラス分の長さを覚えておく
    var strMaskId = strTgtID.replace('red', 'msk');
    var objMskTgt = glObjMaskFlame.getElementById(strMaskId);
    //黒塗り側処理
    var srcMask = glDocumentId + "/m"; //mask用src画像
    var intSrdMaskLen = srcMask.length;
    var strSrc = objMskTgt.getAttribute("src");
    var intSrcLen = strSrc.length;
    var intOffcetLen = intSrcLen - intSrdMaskLen;
    var strDummyCls = '';
    for (let i = 0; i < intOffcetLen - 1; i++) {
        strDummyCls += "0";
    } //for
    var srcMakeSrc = srcMask;
    objMskTgt.src = srcMakeSrc;
    //badge対応の為、マスク側にもinitクラス追加
    objMskTgt.classList.add(MASK_INIT_CLS);
    objMskTgt.classList.add(TAG_MASK);
    objMskTgt.classList.add(strDummyCls);

    //配列情報を格納
    glArrBfIds.push(strTgtID);
    glArrAfIds.push(strTgtID);
    glArrPolicys.push(glChartId);
    glRemarks.push("");
    glArrRepOuter.push(objRedTgt.outerHTML);
    contextNone();
    if (!glBadgeDisabledFlag) {
        //マスク番号再計算
        makeMaskBadge();
        //object最更新
        await exchangeObjectElement();
    } //if
} //function


/**
 * 図・表のマスクを元に戻す
 * @function
 * @param {Event} e イベント
 */
async function returnMaskImg() {
    //黒塗り候補側処理
    var strTgtID = glSelectEndId;
    var objRedTgt = glObjRedFlame.getElementById(strTgtID);

    objRedTgt.classList.remove(RED_INIT_CLS)
    objRedTgt.classList.remove(RED_IMG)

    //黒塗り側処理
    var strMaskId = strTgtID.replace('red', 'msk');
    var objMskTgt = glObjMaskFlame.getElementById(strMaskId);
    var objMskTgtOuter = objRedTgt.outerHTML.replace(strTgtID, strMaskId);
    objMskTgt.outerHTML = objMskTgtOuter;


    //配列要素から削除
    // var intIndex = glArrBfIds.indexOf(glActBfId);
    var intIndex = glArrBfIds.indexOf(strTgtID);
    glArrBfIds.splice(intIndex, 1);
    glArrAfIds.splice(intIndex, 1);
    glArrPolicys.splice(intIndex, 1);
    glArrRepOuter.splice(intIndex, 1);
    glRemarks.splice(intIndex, 1);
    contextNone();

    //候補番号を表示
    if (!glBadgeDisabledFlag) {
        //badgeを削除
        deleteBadge(glActBfId);
        //マスク番号再計算
        makeMaskBadge();
        //object再更新
        await exchangeObjectElement();
    }// if

} //function

/**
 * 図・表をマスクする(Svg用)
 * @function
 * @param {Event} e イベント
 */
async function changeMaskSvg() {
    //黒塗り候補側処理
    var strTgtID = glSelectEndId;
    var strBaseId = strTgtID.substr(3, strTgtID.length);
    var objRedTgt = glObjRedFlame.getElementById(strTgtID);
    var eleId = glSvgSelectElementId;
    // 初期化
    glSvgSelectElementId = "";

    // 画像のみの選択なら文字列空
    if (glObjRedFlame.getSelection().toString() !== "") {
        alert("画像が選択箇所に入っています。\n画像をマスク処理する際は、画像自体を右クリックして「候補指定」を行ってください。");
        contextNone();
        return;
    } //if

    var objSelection = glObjRedFlame.getSelection();
    var $objSelection = $(objSelection);

    //20200129 対象がobjectタグ内にある場合対応
    if (objRedTgt === null) {
        for (let i = 0; i < glObjRedInSvg.length; i++) {
            var strTmpId = glObjRedInSvg[i].documentElement.id;
            if ("red" + strBaseId === strTmpId) {
                objRedTgt = glObjRedInSvg[i].getElementById("red" + strBaseId);
                break;
            } //if
        } //for
    } //if

    var strMaskId = strTgtID.replace('red', 'msk');
    var objMskTgt = glObjMaskFlame.getElementById(strMaskId);

    //20200129 対象がobjectタグ内にある場合対応
    if (objMskTgt == null) {
        for (let i = 0; i < glObjMskInSvg.length; i++) {
            var strTmpId = glObjMskInSvg[i].documentElement.id;
            if ("msk" + strBaseId === strTmpId) {
                objMskTgt = glObjMskInSvg[i].getElementById("msk" + strBaseId);
                break;
            } //if
        } //for
    } //if

    //20200207 Wordとそれ以外で処理を分ける
    if (!eleId) {//pathidが存在しなければWordファイル
        //図表がリストに表示されない修正
        objRedTgt.classList.add(RED_INIT_CLS);
        objRedTgt.classList.add(RED_IMG);

        //黒塗り側処理
        var srcMask = glDocumentId + "/m"; //mask用src画像
        //svgタグ自体をimgタグに置き換える
        var maskSvgWidth = "";
        var maskSvgHeight = "";
        //<object>ではない時
        if (objMskTgt.firstElementChild.tagName !== OBJECT_TAG_NAME) {
            maskSvgWidth = objMskTgt.width.baseVal.valueAsString;
            maskSvgHeight = objMskTgt.height.baseVal.valueAsString;
        } else {
            maskSvgWidth = '' + objMskTgt.clientWidth;
            maskSvgHeight = '' + objMskTgt.clientHeight;
        }//if

        var maskImgTagOuter = '<img id="' + strMaskId + '" src="' + srcMask + '" width="' + maskSvgWidth + '" height="' + maskSvgHeight + '">';
        objMskTgt.outerHTML = maskImgTagOuter;
        objMskTgt = glObjMaskFlame.getElementById(strMaskId); //outerを置き換えたので更新
        //svgタグ自体をimgタグに置き換える end

        //outerHtmlの長さを合わせる
        var intRedImgClsLen = objRedTgt.outerHTML.length; //outerHTMLの長さ
        var intMskImgClsLen = objMskTgt.outerHTML.length; //outerHTMLの長さ
        var intOffcetLen = intRedImgClsLen - intMskImgClsLen;
        var strDummyCls = '';
        for (let i = 0; i < intOffcetLen + intRedImgClsLen; i++) {
            strDummyCls += "0";
        } //for
        objMskTgt.classList.add(strDummyCls);

        //配列情報を格納
        glArrBfIds.push(strTgtID);
        glArrAfIds.push(strTgtID);
        glArrPolicys.push(glChartId);
        glArrRepOuter.push(objRedTgt.outerHTML);
        glRemarks.push("");

        contextNone();
        //マスク番号再計算
        if (!glBadgeDisabledFlag) {
            makeMaskBadge();
            await exchangeObjectElement();
        }//if
    } else {
        var numEleId = eleId.substr(3, eleId.length);
        var objRedSvgElement = objRedTgt.getElementById('red' + numEleId);
        var objMskSvgElement = objMskTgt.getElementById('msk' + numEleId);

        if (objRedSvgElement.tagName === 'path') { //<svg><image>の構成の場合
            //20200221 svgのoldはコメントアウトしておく
            var strRedOldCommentOut = '<!-- ' + objRedSvgElement.outerHTML.replace('xmlns="http://www.w3.org/2000/svg" ', '') + ' -->';
            var strMskOldCommentOut = '<!-- ' + objMskSvgElement.outerHTML.replace('xmlns="http://www.w3.org/2000/svg" ', '') + ' -->';

            //20200225 正規表現だともともとfill fill-opacityがある場合にエラーになるので変更
            objRedSvgElement.setAttribute("fill", '#FF0000');
            objRedSvgElement.setAttribute("fill-opacity", '0.2');
            objMskSvgElement.setAttribute("fill", '#000000');
            objMskSvgElement.setAttribute("fill-opacity", '1.0');

            var redPathOuterHtml = objRedSvgElement.outerHTML;
            var mskPathOuterHtml = objMskSvgElement.outerHTML;
            //20200225 xmlns="http://www.w3.org/2000/svg"はあると黒塗りできない場合があるので削除
            redPathOuterHtml = redPathOuterHtml.replace('xmlns="http://www.w3.org/2000/svg"', '');
            mskPathOuterHtml = mskPathOuterHtml.replace('xmlns="http://www.w3.org/2000/svg"', '');

            var reg = new RegExp(PATH_REG);
            objRedSvgElement.outerHTML = strRedOldCommentOut + redPathOuterHtml.substr(0, redPathOuterHtml.lastIndexOf('/>')) + " class='" + RED_IMG + " " + RED_INIT_CLS + "'/>"
            objMskSvgElement.outerHTML = strMskOldCommentOut + mskPathOuterHtml.substr(0, mskPathOuterHtml.lastIndexOf('/>')) + " class='" + RED_IMG + " " + MASK_INIT_CLS + "'/>"

            glArrBfIds.push(eleId);
            glArrAfIds.push(eleId);
            glArrPolicys.push(glChartId);
            glArrRepOuter.push(objRedSvgElement.outerHTML);
            glRemarks.push("");
        } else if (objRedSvgElement.tagName === 'image') {
            var strRedImgOuterHtml = objRedSvgElement.outerHTML;
            var strMskImgOuterHtml = objMskSvgElement.outerHTML;
            //msk側は元画像の指定を外す
            strMskImgOuterHtml = strMskImgOuterHtml.replace(/(xlink:href=")[\s\S]*?(")/, '$1./m$2');
            var intRedImgClsLen = strRedImgOuterHtml.length; //outerHTMLの長さ
            var intMskImgClsLen = strMskImgOuterHtml.length; //outerHTMLの長さ
            var intOffcetLen = intRedImgClsLen - intMskImgClsLen;
            var strDummyCls = ' ';//文字数の差分をなくすための0埋め
            for (let i = 1; i < intOffcetLen; i++) {
                strDummyCls += "0";
            } //for

            // 赤塗用のrect作成
            var strRedNewRect = objRedSvgElement.outerHTML
                .replace('xmlns:xlink="http://www.w3.org/1999/xlink" ', '')
                .replace('xmlns="http://www.w3.org/2000/svg" ', '')
                .replace(/xlink:href="[\s\S]*?" /, '')
                .replace('id="red', 'id="rct')
                .replace('image', 'rect');
            // 黒塗用のrect作成
            var strMskNewRect = objMskSvgElement.outerHTML
                .replace('xmlns:xlink="http://www.w3.org/1999/xlink" ', '')
                .replace('xmlns="http://www.w3.org/2000/svg" ', '')
                .replace(/xlink:href="[\s\S]*?" /, '')
                .replace('id="msk', 'id="rct')
                .replace('image', 'rect');

            objRedSvgElement.outerHTML = strRedImgOuterHtml.substr(0, strRedImgOuterHtml.lastIndexOf('/>')) + " class='" + RED_IMG + " " + RED_INIT_CLS + "'/>"
                + strRedNewRect.substr(0, strRedNewRect.lastIndexOf('/>')) + " class='" + RED_IMG + " " + RED_INIT_CLS + "' fill='#FF0000' fill-opacity='0.2' />";
            objMskSvgElement.outerHTML = strMskImgOuterHtml.substr(0, strMskImgOuterHtml.lastIndexOf('/>')) + " class='" + RED_IMG + " " + MASK_INIT_CLS + strDummyCls + "'/>"
                + strMskNewRect.substr(0, strMskNewRect.lastIndexOf('/>')) + " class='" + RED_IMG + " " + MASK_INIT_CLS + "' fill='#000000' fill-opacity='1.0'/>"
            glArrBfIds.push(eleId);
            glArrAfIds.push(eleId);
            glArrPolicys.push(glChartId);
            glArrRepOuter.push(objRedSvgElement.outerHTML);
            glRemarks.push("");
        }

        contextNone();

        //20200221 SVG処理最後に保存処理
        saveSvg();

        //マスク番号再計算
        if (!glBadgeDisabledFlag) {
            makeMaskBadge();
            //object最更新
            await exchangeObjectElement();
        }//if
    }
} //function

/**
 * 図・表のマスクを元に戻す(Svg用)
 * @function
 * @param {Event} e イベント
 */
async function returnMaskSvg() {
    //黒塗り候補側処理
    var strTgtID = glSelectEndId;
    var strBaseId = strTgtID.substr(3, strTgtID.length);
    var objRedTgt = glObjRedFlame.getElementById(strTgtID);
    var eleId = glSvgSelectElementId;
    // 初期化
    glSvgSelectElementId = "";

    var objSelection = glObjRedFlame.getSelection();
    var $objSelection = $(objSelection);

    //20200129 対象がobjectタグ内にある場合対応
    if (objRedTgt === null) {
        for (let i = 0; i < glObjRedInSvg.length; i++) {
            var strTmpId = glObjRedInSvg[i].documentElement.id;
            if ("red" + strBaseId === strTmpId) {
                objRedTgt = glObjRedInSvg[i].getElementById("red" + strBaseId);
                break;
            } //if
        } //for
    } //if

    //黒塗り側処理
    var strMaskId = strTgtID.replace('red', 'msk');
    var objMskTgt = glObjMaskFlame.getElementById(strMaskId);

    //20200129 対象がobjectタグ内にある場合対応
    if (objMskTgt == null) {
        for (let i = 0; i < glObjMskInSvg.length; i++) {
            var strTmpId = glObjMskInSvg[i].documentElement.id;
            if ("msk" + strBaseId === strTmpId) {
                objMskTgt = glObjMskInSvg[i].getElementById("msk" + strBaseId);
                break;
            } //if
        } //for
    } //if

    //20200214 Wordとそれ以外で処理を分ける
    if (!eleId) {//pathidが存在しなければWordファイル
        objRedTgt.classList.remove(RED_INIT_CLS);
        objRedTgt.classList.remove(RED_IMG);
        var objMskTgtOuter = objRedTgt.outerHTML.replace(strTgtID, strMaskId);
        objMskTgt.outerHTML = objMskTgtOuter;

        //配列要素から削除
        // var intIndex = glArrBfIds.indexOf(glActBfId);
        var intIndex = glArrBfIds.indexOf(strTgtID);
        glArrBfIds.splice(intIndex, 1);
        glArrAfIds.splice(intIndex, 1);
        glArrPolicys.splice(intIndex, 1);
        glArrRepOuter.splice(intIndex, 1);
        glRemarks.splice(intIndex, 1);
        contextNone();

        //候補番号を表示
        if (!glBadgeDisabledFlag) {
            //badgeを削除
            deleteBadge(glActBfId);
            //マスク番号再計算
            makeMaskBadge();
        }

    } else if (eleId.indexOf('rct') === -1) { // objectの黒塗り化解除
        var numEleId = eleId.substr(3, eleId.length);
        var objRedSvgElement = objRedTgt.getElementById('red' + numEleId);
        var objMskSvgElement = objMskTgt.getElementById('msk' + numEleId);

        //20200221 svgを一旦削除
        var strRedSvg = '';
        strRedSvg = objRedTgt.outerHTML.replace(objRedSvgElement.outerHTML).replace('undefined', '');
        //20200221 svgのoldのコメントアウトを外す
        var strReg = '<!-- (<path id\="red' + numEleId + '.+?/>) -->';

        var objPattern = new RegExp(strReg, 'gi');
        strRedSvg = strRedSvg.match(objPattern)[0];
        strRedSvg = strRedSvg.replace('<!-- ', '');
        strRedSvg = strRedSvg.replace(' -->', '');
        objRedSvgElement.outerHTML = strRedSvg;
        objMskSvgElement.outerHTML = strRedSvg.replace('red', 'msk');

        var intIndex = glArrBfIds.indexOf(eleId);
        glArrBfIds.splice(intIndex, 1);
        glArrAfIds.splice(intIndex, 1);
        glArrPolicys.splice(intIndex, 1);
        glArrRepOuter.splice(intIndex, 1);
        glRemarks.splice(intIndex, 1);

        contextNone();

        //20200221 SVG処理最後に保存処理
        saveSvg();
        //候補番号を表示
        if (!glBadgeDisabledFlag) {
            //badgeを削除
            deleteBadge(glActBfId);
            //マスク番号再計算
            makeMaskBadge();
            // object再更新
            await exchangeObjectElement();
        } //if


    } else {
        var numEleId = eleId.substr(3, eleId.length);
        // 黒塗りコード削除
        objRedTgt.getElementById(eleId).remove();
        objMskTgt.getElementById(eleId).remove();

        var objRedSvgElement = objRedTgt.getElementById('red' + numEleId);
        var objMskSvgElement = objMskTgt.getElementById('msk' + numEleId);
        // class削除(classごと)
        var objSvgOuterHtml = objRedSvgElement.outerHTML

        // 黒塗りのimageを元に戻す
        objRedSvgElement.outerHTML = objSvgOuterHtml.replace('class="redimg tagRedInit"', '');
        objMskSvgElement.outerHTML = objSvgOuterHtml.replace('class="redimg tagRedInit"', '').replace('red', 'msk');
        // メニューを閉じる
        contextNone();
        //20200221 SVG処理最後に保存処理
        saveSvg();
        //候補番号を表示
        if (!glBadgeDisabledFlag) {
            //badgeを削除
            deleteBadge(glActBfId);
            //マスク番号再計算
            makeMaskBadge();
            // object再更新
            await exchangeObjectElement();
        } //if
    }//if


} //function

async function changeMaskMultiImg() {
    console.log("複数画像黒塗り");

    var objSelection = glObjRedFlame.getSelection(); // 選択範囲のオブジェクト取得
    var objTgtRange = objSelection.getRangeAt(0); //rangeを取得
    var innerHtml = objTgtRange.commonAncestorContainer.innerHTML;

    var startId = Number(objSelection.anchorNode.id.replace('red', ''));
    var endId = Number(objSelection.focusNode.id.replace('red', ''));
    var objMskTgt = glObjRedFlame.getElementById('red' + endId);
    // 終了位置のidの次が<object>タグの場合終了位置を補正する
    if (objMskTgt.firstElementChild.tagName === OBJECT_TAG_NAME) {
        endId = Number(objMskTgt.firstElementChild.id.replace('red', ''));
    }

    var regAll = new RegExp(TAG_ID_REG, 'g');
    var regTagId = new RegExp(TAG_ID_REG);
    var regClass = new RegExp(CLASS_REG);
    var resultList = innerHtml.match(regAll);
    for (result in resultList) {
        console.log(resultList[result]);
        var matchPoint = resultList[result].match(regTagId);
        var classValue = resultList[result].match(regClass);
        console.log(matchPoint[1] + ":" + matchPoint[2]);
        // mathPoint[1]該当タグ名 mathPoint[2]該当id
        var tagName = matchPoint[1];
        var id = matchPoint[2].replace('red', '');
        // objectにclassは含まれないため、正規表現を分けて別取得
        console.log(classValue);
        // 既に黒塗り化されている画像は処理しない
        if (classValue) {
            var className = classValue[0];
            if (className.indexOf(RED_IMG) !== -1) {
                continue;
            }
        }
        // idが開始終了位置の間にある時のみ取り出す
        if (id >= startId && endId >= id) {
            //画像要素のみ取り出す
            if (tagName == 'img') {
                glSelectEndId = 'red' + id;
                await changeMaskImg();
            } else if (tagName == 'svg') {
                glSelectEndId = 'red' + id;
                await changeMaskSvg();
            } else if (tagName == 'object') {
                //objectの場合親のidが必要なため、idを-1
                glSelectEndId = 'red' + (id - 1);
                await changeMaskSvg();
            }
        }//if
    }//for
    // innnerHTML時に<object>が初期化されてしまうため元に戻す
    await exchangeObjectElement();

}

function returnMaskMultiImg() {
    console.log("複数画像黒塗り解除");
}

/**
 * マウスホバー時のポリシー名表示
 * @function
 * @param {Event} e イベント
 */
function mouseOverAct(e) {
    var strHover = "<div class='arrow'></div><div class='popover-content'></div>";
    var strPolicyName = "";
    if (e.target.classList.contains(TAG_RED)) {

        var strBfId = searchPolicyById(e);

        if (glIntTgtIdIdx == strBfId) {
            var intIndex = glArrBfIds.indexOf(strBfId);
            var intTgtPolicyId = glArrPolicys[intIndex];
            strPolicyName = glHashPolicy[intTgtPolicyId];
            var objTgtDom = document.getElementById("polocyinfo");
            strHover += strPolicyName + '</div>';
            objTgtDom.innerHTML = strHover;

            objTgtDom.style.left = glIntTgtIdLef + "px";
            objTgtDom.style.top = glIntTgtIdTop + "px";

            objTgtDom.style.display = "block";

        } else {

            glIntTgtIdIdx = strBfId;

            var intIndex = glArrBfIds.indexOf(strBfId);
            var intTgtPolicyId = glArrPolicys[intIndex];
            strPolicyName = glHashPolicy[intTgtPolicyId];
            var objTgtDom = document.getElementById("polocyinfo");
            strHover += strPolicyName + '</div>';

            objTgtDom.innerHTML = strHover;
            objTgtDom.style.left = e.screenX - 0 - window.screenX - OFFSET_X + "px";
            objTgtDom.style.top = e.screenY - 100 - window.screenY - OFFSET_X + "px";

            glIntTgtIdLef = objTgtDom.style.left;
            glIntTgtIdTop = objTgtDom.style.top;

            objTgtDom.style.display = "block";
        }// if


    } else if (e.target.classList.contains(RED_IMG)) {
        // ポリシー名
        var strBfId = searchPolicyById(e);

        if (glIntTgtIdIdx == strBfId) {
            strPolicyName = CHART_POLICY;
            var objTgtDom = document.getElementById("polocyinfo");
            strHover += strPolicyName + '</div>';
            objTgtDom.innerHTML = strHover;
            objTgtDom.style.left = glIntTgtIdLef + "px";
            objTgtDom.style.top = glIntTgtIdTop + "px";
            objTgtDom.style.display = "block";
        } else {
            glIntTgtIdIdx = strBfId;
            strPolicyName = CHART_POLICY;
            var objTgtDom = document.getElementById("polocyinfo");
            strHover += strPolicyName + '</div>';
            objTgtDom.innerHTML = strHover;
            objTgtDom.style.left = e.screenX - 0 - window.screenX - OFFSET_X + "px";
            objTgtDom.style.top = e.screenY - 100 - window.screenY - OFFSET_X + "px";
            objTgtDom.style.display = "block";
            glIntTgtIdLef = objTgtDom.style.left;
            glIntTgtIdTop = objTgtDom.style.top;
        } //if
    } //if
} //function

/**
 * idからポリシー名を引き当てる
 * @function
 * @param {Event} e イベント
 * @return strBfId
 */
function searchPolicyById(e) {
    //ポリシー名引当て
    var strTgtId = e.target.id;
    var intTgtIdIdx = Number(strTgtId.substr(3, strTgtId.length));

    var intCnt = 1000000;
    var strBfId = "";
    var i = 0;

    while (true) {
        var strTgtId = "red" + String(intTgtIdIdx - i);
        if (glArrBfIds.indexOf(strTgtId) >= 0) {
            strBfId = strTgtId;
            break;
        } //if
        i++;
        intCnt--;
        if (0 > intCnt) { //フェールセーフ
            console.log("カウントが「" + intCnt + "」になったため、ポリシー検索を中断");
            break;
        } //if
    } //while
    return strBfId;
}

/**
 * マウスホバーアウト時のアクション
 * @function
 * @param {Event} e イベント
 */
function mouseOutAct(e) {
    var objTgtDom = document.getElementById("polocyinfo");
    objTgtDom.style.display = "none";
}//function

/**
 * 参照文書検索画面を表示する
 * @function
 */
function disRef() {

    var blRet = confirm("「一時保存」後に「参照文書検索画面」を表示しないと編集内容が復元できません。\r\n「一時保存」を行って「参照文書検索画面」を表示してよろしいですか?");
    if (blRet) {

        //一時保存処理
        saveTmpDocDelMain(1); //Delete → Insert
        saveTmpDocMain(1);

        var objForm = document.createElement('form');
        var objReq = document.createElement('input');


        objForm.method = 'GET';
        objForm.action = "docManage/searchReferenceFile";

        objReq.type = 'hidden'; //入力フォームが表示されないように
        objReq.name = 'documentId';
        objReq.value = glDocumentId;

        objForm.appendChild(objReq);

        document.body.appendChild(objForm);

        //POST送信フラグを「true」に設定
        $("#top").select();
        isPost = true;

        objForm.submit();
    } //if
} //function

/**
 * 黒塗り文書作成画面を閉じる
 * @function
 */
function closeMaskDoc() {
    var blSel = confirm("本当にキャンセル操作をしますか？");
    if (blSel) {

        var blRet = confirm("「一時保存」後に「黒塗り文書作成画面」を閉じないと編集内容が復元できません。\r\n「黒塗り文書作成画面」を閉じる際に、「一時保存」を実施しますか?");
        if (blRet) {

            //一時保存処理
            saveTmpDocDelMain(1); //Delete → Insert
            saveTmpDocMain(1);
            //POST送信フラグを「true」に設定
            $("#top").select();
            isPost = true;

            try {
                if ((window.opener) && (Object.keys(window.opener).length)) {
                    if (window.opener.SearchMain && typeof window.opener.SearchMain.afterChildClose === 'function') {
                        window.opener.SearchMain.afterChildClose();
                    } //if
                } //if
            } catch (error) {
                console.log(error);
            } finally {
                window.close();
            } //try

        } else {

            isPost = true;
            try {
                if ((window.opener) && (Object.keys(window.opener).length)) {
                    if (window.opener.SearchMain && typeof window.opener.SearchMain.afterChildClose === 'function') {
                        window.opener.SearchMain.afterChildClose();
                    } //if
                } //if
            } catch (error) {
                console.log(error);
            } finally {
                window.close();
            } //try
        } //if

    }//if

} //function

/**
 * ユーザーIDをセットする
 * @function
 */
function setUserId() {

    var strUserId = "";
    try {
        strUserId = DomainCookie.getUserId();
    } catch (error) {
        console.log("DOMAINCookieは設定されていません");
        strUserId = "";
    } //try

    $.ajax({
        type: 'GET',
        url: 'rest/useidset?userId=' + strUserId,
        processData: false, // Ajaxがdataを整形しない指定
        contentType: false, // contentTypeもfalseに指定(Fileをアップロード時は必要)
        async: false, //非同期false
        success: function (retData) {
            console.log("success");
            return false;
        }, //function
        error: function (e) {
            console.log("fail");
            return false;
        } //function
    }); //ajax
} //function

/**
 * ユーザーIDがセットされているかチェックする
 * @function
 * @return {Boolean} true セットされている false セットされていない
 */
function isUserId() {
    var strCookieIds = document.cookie.split(';');
    var blRet = false;
    for (let i = 0; i < strCookieIds.length; i++) {
        var objUserKey = strCookieIds[i].split('=')
        if (objUserKey[0].indexOf("user_id") >= 0) {
            blRet = true;
            return blRet;
        } //if
    } //for
    return blRet;

} //function



/**
 * ユーザー名をセットする
 * @function
 */
function setUserName() {

    var strUserName = "";
    try {
        strUserName = DomainCookie.getUserName();
    } catch (error) {
        console.log("DOMAINCookieは設定されていません");
        strUserName = "";
    } //try

    $.ajax({
        type: 'GET',
        url: 'rest/usernameset?userName=' + strUserName,
        processData: false, // Ajaxがdataを整形しない指定
        contentType: false, // contentTypeもfalseに指定(Fileをアップロード時は必要)
        async: false, //非同期false
        success: function (retData) {
            console.log("success");
            return false;
        }, //function
        error: function (e) {
            console.log("fail");
            return false;
        } //function
    }); //ajax
} //function

/**
 * ユーザー名がセットされているかチェックする
 * @function
 * @return {Boolean} true セットされている false セットされていない
 */
function isUserName() {
    var strCookieIds = document.cookie.split(';');
    var blRet = false;
    for (let i = 0; i < strCookieIds.length; i++) {
        var objUserKey = strCookieIds[i].split('=')
        if (objUserKey[0].indexOf("user_name") >= 0) {
            blRet = true;
            return blRet;
        } //if
    } //for
    return blRet;

} //function

/**
 * 文字列のバイト長さを返す
 * @function
 * @return {Number} バイト長
 */
String.prototype.bytes = function () {
    return (encodeURIComponent(this).replace(/%../g, "x").length);
} //function

/**
 * 範囲選択に含まれる黒塗りを全て削除
 */
async function tgtSelectMaskRelease() {
    //選択されていなかったらreturn
    if (glObjRedFlame.getSelection().toString() == "") {
        return;
    } //if

    // 選択範囲の情報取得
    var selection = glObjRedFlame.getSelection();
    var range = selection.getRangeAt(0);
    var df = range.cloneContents();
    // 選択した先頭及び、最後尾が黒塗りか確認
    var blackPoint = blackPointCheck(range, 0, 0);
    //選択した先頭要素が黒塗り文字か(true:黒塗)
    var frontBlackPointFlag = blackPoint.get("frontBlackPointFlag")
    //選択した最後尾要素が黒塗り文字か(true:黒塗)
    var backBlackPointFlag = blackPoint.get("backBlackPointFlag");

    var strTgtVal = "";
    var arrPos = getSelectionInnerPos(true, frontBlackPointFlag, backBlackPointFlag, 0, 0);
    var blackPaintFlag = false;

    // 黒塗りチェック１
    if (glDocumentInfoLists[0].extension === "txt") {
        if (arrPos.length >= 3) {
            var frontId = frontBlackPointFlag ? df.firstElementChild.id : "idNull";
            var backId = backBlackPointFlag ? df.lastElementChild.id : "idNull";
            // 選択範囲補正
            correctionSelectRange(frontId, backId, range);
            arrPos = getSelectionInnerPos();
            blackPaintFlag = true;
        } //if
    }

    var intInitPartPos = null;
    var intEndPartPos = null;
    var strInnerBody = "";

    intInitPartPos = arrPos[0];
    intEndPartPos = arrPos[1];
    strInnerBody = glObjRedFlame.body.innerHTML;
    strMaskInnerBody = glObjMaskFlame.body.innerHTML;

    //値を実際に取得
    strTgtVal = strInnerBody.substring(intInitPartPos, intEndPartPos);

    // var strReg = RED_ORG_GET;
    strReg = RED_INIT_CLS + "|" + RED_END_CLS;
    objPattern = new RegExp(strReg, "gi");
    if (objPattern.test(strTgtVal) || frontBlackPointFlag || backBlackPointFlag) {
        blackPaintFlag = true;
        if (glDocumentInfoLists[0].extension === "txt") {
            if (arrPos.length < 3) {
                // 1文字解除の場合(childElementCountが0)
                if (0 === df.childElementCount) {
                    /* 1文字の場合はdf.firstElementChildに値がない
                       そのためフラグによってfrontIdとbackIdにdf.firstElementChildと同じ値のrange.startContainer.parentElement.idをセット */
                    var frontId = frontBlackPointFlag ? range.startContainer.parentElement.id : "idNull";
                    var backId = backBlackPointFlag ? range.startContainer.parentElement.id : "idNull";
                } else {
                    // 黒塗りチェック１に該当しない場合
                    var frontId = frontBlackPointFlag ? df.firstElementChild.id : "idNull";
                    var backId = backBlackPointFlag ? df.lastElementChild.id : "idNull";
                }
                // 選択範囲補正
                correctionSelectRange(frontId, backId, range);
            }
        } else {
            var frontId = frontBlackPointFlag ? blackPoint.get("frontBlackPointID") : "idNull";
            var backId = backBlackPointFlag ? blackPoint.get("backBlackPointID") : "idNull";
            // 選択範囲補正
            correctionSelectRange(frontId, backId, range);
        }
        // 補正後の値で再度黒塗り文書取得
        arrPos = getSelectionInnerPos(true, frontBlackPointFlag, backBlackPointFlag, 0 ,0);
        glStrideBlackList = [];
        intInitPartPos = arrPos[0];
        intEndPartPos = arrPos[1];
        strInnerBody = glObjRedFlame.body.innerHTML;
        strMaskInnerBody = glObjMaskFlame.body.innerHTML;
        //値を実際に取得
        strTgtVal = strInnerBody.substring(intInitPartPos, intEndPartPos);
        // END IWABCUHI
    } else {
        alert("選択箇所に黒塗り候補は存在しません。");
        return;
    }//if

    //画像は範囲選択で含めない(単体でマスク指定)
    var strReg = '\<img';
    var objPattern = new RegExp(strReg, "gi");
    if (objPattern.test(strTgtVal)) {
        alert("画像が選択箇所に入っています。\n画像をマスク処理する際は、画像自体を右クリックして「候補指定」を行ってください。");
        contextNone();
        return;
    } //if

    // 黒塗り候補削除
    if (blackPaintFlag) {
        var objPatternInit = new RegExp(RED_INIT_ORG_GET, 'gi'); //グルーピングで入れ替える
        var blackIdList = strTgtVal.match(objPatternInit);
        // グローバルから選択範囲の黒塗り削除
        for (var idx = 0; idx < blackIdList.length; idx++) {
            var str = blackIdList[idx];
            var objPatternRedId = new RegExp(RED_ID_RED);
            var id = str.match(objPatternRedId);
            var intIndex = glArrBfIds.indexOf(id[0]);

            // 対象の黒塗り全削除
            await tgtMaskOrg(glArrBfIds[intIndex], glArrAfIds[intIndex]);
            //候補番号を表示
            if (!glBadgeDisabledFlag) {
                //badgeを削除
                deleteBadge(glActBfId);
                //マスク番号再計算
                makeMaskBadge();
                // object再更新
                await exchangeObjectElement();
            }
            glArrBfIds.splice(intIndex, 1);
            glArrAfIds.splice(intIndex, 1);
            glArrPolicys.splice(intIndex, 1);
            glArrRepOuter.splice(intIndex, 1);

        }
    }
    contextNone();

} //function

/**
 * idから黒塗りリストを検索する
 * @param id 検索に用いるID
 * @return arrRedIds IDが含まれる黒塗りリスト
 */
function searchBlackTarget(id) {
    var intIndex = 0;
    for (var i = 0; i < glArrRepOuter.length; i++) {
        var objTgt = glArrRepOuter[i];
        if (objTgt.indexOf(id) >= 0) {
            intIndex = i;
            break;
        } //if
    } //for

    var objPattern = new RegExp(RED_ID_RED, "g");
    var arrRedIds = glArrRepOuter[intIndex].match(objPattern);
    return arrRedIds;
}

/**
 * 選択した先頭及び最後尾が黒塗り文字か判断するメソッド
 * @param range 選択されている文字列
 * @param paintExeFlg 黒塗り処理フラグ
 */
function blackPointCheck(range, frontRowCnt, endRowCnt) {
    var blackPoint = new Map([
        ["frontBlackPointFlag", false],
        ["backBlackPointFlag", false],
        ["frontBlackPointID", ""],
        ["backBlackPointID", ""]
    ]);
    var startContainer = range.startContainer;
    var endContainer = range.endContainer;
    var df = range.cloneContents();
    var nodes = df.childNodes;
    if (glDocumentInfoLists[0].extension === "txt") {
        for (var idx = 0; idx < nodes.length; idx++) {
            var node = nodes[idx];
            // 選択された範囲が1文字、且つnodeTypeがテキストの場合
            if (0 === df.childElementCount && TEXT_NODE_TYPE === node.nodeType && 1 === glObjRedFlame.getSelection().toString().length) {
                var parentTag = startContainer.parentNode;
                if (parentTag.className.match(TAG_RED)) { // 黒塗りされている場合(黒塗り後の文字列はparentNodeのclassNameがtagRed)
                    blackPoint.set("frontBlackPointFlag", true);
                    blackPoint.set("backBlackPointFlag", true);
                }
            }
            if (node.nodeType !== TEXT_NODE_TYPE) {
                if (idx === 0 && 0 === frontRowCnt) {//先頭が改行ではない場合
                    blackPoint.set("frontBlackPointFlag", true);
                }
                if (idx === nodes.length - 1 && 0 === endRowCnt) {//末尾が改行ではない場合
                    blackPoint.set("backBlackPointFlag", true);
                }
            }
        }
    } else {
        if (startContainer.nodeType === TEXT_NODE_TYPE) {
            var startClassName = startContainer.parentNode.className;
            // classNameにSVGAnimatedString型の値が入る事があるため文字列かチェックする
            if (typeof startClassName === 'string' || startClassName instanceof String) {
                if (startClassName.match(TAG_RED_CLASS)) {
                    blackPoint.set("frontBlackPointFlag", true);
                    blackPoint.set("frontBlackPointID", startContainer.parentNode.id);
                }
            }
        }
        if (endContainer.nodeType === TEXT_NODE_TYPE) {
            var endClassName = endContainer.parentNode.className;
            if (typeof endClassName === 'string' || endClassName instanceof String) {
                if (endClassName.match(TAG_RED_CLASS)) {
                    blackPoint.set("backBlackPointFlag", true);
                    blackPoint.set("backBlackPointID", endContainer.parentNode.id);
                }
            }
        } else {
            var endClassName = endContainer.className;
            if (typeof endClassName === 'string' || endClassName instanceof String) {
                if (endClassName.match(TAG_RED_CLASS)) {
                    blackPoint.set("backBlackPointFlag", true);
                    blackPoint.set("backBlackPointID", endContainer.id);
                } else if (endClassName.match(TAG_AWSPAN_CLASS)) {
                    //末尾半角スペースはfirstChild.classNameがundefinedのためtrueにしない
                    //           前の要素がない場合、previousElementSiblingがunllになるのでtrueにしない
                    if (null !== endContainer.previousElementSibling &&
                        undefined !== endContainer.previousElementSibling.firstChild.className) {
                        if (endContainer.previousElementSibling.firstChild.className.match(TAG_RED_CLASS)) {
                            blackPoint.set("backBlackPointFlag", true);
                            blackPoint.set("backBlackPointID", endContainer.previousSibling.firstChild.id);
                        }
                    }
                }
            }
        }
    }

    return blackPoint;
}

/**
 * 跨いだ黒塗りの時先頭位置及び最後尾の位置を補正する
 * @param frontId 補正前選択id(先頭)
 * @param backId 補正前選択id(最後尾)
 * @param range 選択中のrange要素
*/
function correctionSelectRange(frontId, backId, range) {
    //glArrRepOuterから選択するIDを捜索
    // var arrRedIds =  $('#red').contents().find('#'+strActId).siblings(); //兄弟要素じゃないもの取れないので却下

    // 補正対象idが黒塗り位置ではなかった場合補正をせずに戻る
    if (frontId === "idNull" && backId === "idNull") {
        return false;
    }

    var frontArrRedIds;
    var strBfId;
    var frontArrRedIds;
    var strAfId;
    //rangeの作成
    objRange = glObjRedFlame.createRange();
    if (frontId !== "idNull") {
        frontArrRedIds = searchBlackTarget(frontId);
        strBfId = frontArrRedIds[0];
        glSelectInitId = strBfId;
        objRange.setStart(glObjRedFlame.getElementById(strBfId), 0);
    } else {
        var startNode = range.startContainer;
        var startChildNodes = range.startContainer.parentNode.childNodes;
        var strBfId = startNode.parentNode.id;
        var childCnt = 0;
        if (startNode.previousElementSibling) {
            var id = startNode.previousElementSibling.id
            for (var idx = 0; idx < startChildNodes.length; idx++) {
                if (startChildNodes[idx].id === id) {
                    childCnt = idx + 1;
                    break;
                }
            }
        }
        objRange.setStart(glObjRedFlame.getElementById(strBfId).childNodes[childCnt], range.startOffset);
    }
    if (backId !== "idNull") {
        backArrRedIds = searchBlackTarget(backId);
        strAfId = backArrRedIds[backArrRedIds.length - 1];
        glSelectEndId = strAfId;
        objRange.setEnd(glObjRedFlame.getElementById(strAfId), glObjRedFlame.getElementById(strAfId).innerText.length);
    } else {
        var endNode = range.endContainer;
        var endChildNodes = range.endContainer.parentNode.childNodes;
        var strAfId = endNode.parentNode.id;
        var childCnt = 0;
        if (endNode.previousElementSibling) {
            var id = endNode.previousElementSibling.id
            for (var idx = 0; idx < endChildNodes.length; idx++) {
                if (endChildNodes[idx].id === id) {
                    childCnt = idx + 1;
                    break;
                }
            }
        }
        var nodes = glObjRedFlame.getElementById(strAfId).childNodes
        objRange.setEnd(nodes[childCnt], range.endOffset);
    }
    var objTgtSelection = glObjRedFlame.getSelection();
    glObjRedBody.focus();
    objTgtSelection.removeAllRanges();
    objTgtSelection.addRange(objRange);
} //function


/**
 * 黒塗り表示ボタン押下時の処理メソッド
 * @returns
 */
function disMask() {
    // TODO:↓後で消す
    console.log("黒塗り表示ボタン押下");
    //TODO: ひとまず参照表示時に黒塗り処理したHTMLのデータも取得しているため。表示を切り替える
    // 黒塗り系表示
    $("#maskDiv").show();
    $(".maskPage").show();
    $("#backpaintView").show();
    $("#SANSHOU_BUNSHO_HYOUJI").show();
    $("#mask_file_icon").show();

    // 参照文書系非表示0
    $("#refDiv").hide();
    $(".refPage").hide();
    $("#refView").hide();
    $("#KURONURI_HYOUJI").hide();
    $("#ref_file_icon_s").hide();
    $("#REF_FILE").hide();


    repDiv.scrollTo(0, glIntPageAct);
}

/**
 * 黒塗り化した<span>タグにwidthを追加するメソッド
 * @function
 */
function addWidthBlackPaint() {
    // 黒塗りID全取得
    var redIdList = [];
    for (var idx = 0; idx < glArrBfIds.length; idx++) {
        var strBfId = glArrBfIds[idx];
        var strAfId = glArrAfIds[idx];
        var bfId = parseInt(strBfId.replace("red", ""));
        var afId = parseInt(strAfId.replace("red", ""));
        for (var id = bfId; id <= afId; id++) {
            redIdList.push(id);
        }
    } //for

    // 横幅取得
    for (var idx = 0; idx < redIdList.length; idx++) {
        var redEle = glObjRedFlame.getElementById("red" + redIdList[idx]);
        var spaceFlag = false;
        if (!redEle) {//glObjRedFlameの中のidで見つからない場合object要素の中のため横幅指定する必要なし
            continue;
        }
        // 半角スペースの時
        if (redEle.innerHTML == ' ') {
            redEle.innerHTML = '&nbsp';
            spaceFlag = true;
        }

        var style = document.defaultView.getComputedStyle(redEle, '');
        var strWidth = style['width'];
        var redWidth = parseFloat(strWidth.replace("px", ""));
        // 小数点以下2桁にまる
        var width = redWidth;

        // 横幅が取得出来た時半角スペースに戻す
        if (spaceFlag) {
            redEle.innerHTML = ' ';
        }

        var mskEle = glObjMaskFlame.getElementById("msk" + redIdList[idx]);
        redEle.style.width = width + "px";
        mskEle.style.width = width + "px";

    }
}

/**
 * 黒塗り化した<span>タグのwidthを削除するメソッド
 * @param {*} bfId 黒塗り開始id
 * @param {*} afId 黒塗り終了id
 */
function deleteWidthBlackPaint(strBfId, strAfId) {
    //指定した横幅のstyleを削除
    var bfId = parseInt(strBfId.replace("red", ""));
    var afId = parseInt(strAfId.replace("red", ""));
    for (var id = bfId; id <= afId; id++) {
        var redEle = glObjRedFlame.getElementById("red" + id);
        var mskEle = glObjMaskFlame.getElementById("msk" + id);
        //横幅削除(styleごと消しこむ)
        redEle.removeAttribute('style');
        mskEle.removeAttribute('style');

    } //for
}


/**
 * マスク箇所のバッチを作成、再計算する
 */
async function makeMaskBadge() {

    var intBadgeNum = 0; //バッジ番号

    //ページ、登場箇所順でソートし直す
    var arrTmpPages = glObjRedFlame.getElementsByClassName("awdiv awpage"); //pageクラス
    var strRedMakeOuter = '';
    var strMskMakeOuter = '';

    //ページLoop
    for (let i = 0; i < arrTmpPages.length; i++) {
        var objTgtPageDom = arrTmpPages[i];

        var arrRedInits = objTgtPageDom.getElementsByClassName(RED_INIT_CLS);
        //登場箇所Loop
        intBadgeNum = 1;
        for (let j = 0; j < arrRedInits.length; j++) {
            var objTgtDom = arrRedInits[j];
            var strBaseId = objTgtDom.id.substr(3, objTgtDom.id.length); //マスクのスパンを引き当てるのに使用
            var strBadgeId = 'bdg' + strBaseId;
            var objBdgDom = glObjRedFlame.getElementById(strBadgeId);
            //main処理
            if (objBdgDom !== null) { //badgeがすでにある場合innerTextのみ変更
                objBdgDom.innerText = intBadgeNum;
                objBdgDom = glObjMaskFlame.getElementById(strBadgeId);
                if (objBdgDom !== null) { //badgeがすでにある場合innerTextのみ変更
                    objBdgDom.innerText = intBadgeNum;
                } //if



            } else { //ない場合追加

                //badge追加
                var strRedBdgOuter = '';
                var strMskBdgOuter = '';
                if (glDocumentInfoLists[0].extension === "txt") { //topのoffset量調整
                    strBaseTop = objTgtDom.getClientRects()[0].top - 20 + "px";
                } else if (objTgtDom.tagName === 'IMG') { //図の場合
                    strBaseTop = objTgtDom.getClientRects()[0].top + "px";
                } else { //通常
                    strBaseTop = objTgtDom.getClientRects()[0].top - 27 + "px";
                } //if
                strBaseLeft = objTgtDom.getClientRects()[0].x + "px";

                var dispFlag = document.getElementById("badgeOn").checked;
                var strDispStyle = dispFlag ? 'display:block' : 'display:none';
                strRedBdgOuter = RED_BADGE_INIT + strBaseId + "' style='top:" + strBaseTop + ";left:" + strBaseLeft + ";" + strDispStyle + "'>" + intBadgeNum + '</span>';
                strMskBdgOuter = MSK_BADGE_INIT + strBaseId + "' style='top:" + strBaseTop + ";left:" + strBaseLeft + ";" + strDispStyle + "'>" + intBadgeNum + '</span>';

                strRedMakeOuter += strRedBdgOuter;
                strMskMakeOuter += strMskBdgOuter;

            } //if

            intBadgeNum++;

        } //for
        // object要素にも追加する
        var objSvgEles = objTgtPageDom.getElementsByTagName('object');
        console.log(objSvgEles);
        for (let j = 0; j < objSvgEles.length; j++) {
            var doc = objSvgEles[j];
            var objSvgInits = doc.contentDocument.documentElement.getElementsByClassName(RED_INIT_CLS);
            for (let k = 0; k < objSvgInits.length; k++) {
                var objSvgDom = objSvgInits[k];
                console.log(objSvgDom);
                var strBaseId = objSvgDom.id.substr(3, objSvgDom.id.length); //マスクのスパンを引き当てるのに使用
                var strBadgeId = 'bdg' + strBaseId;
                var objBdgDom = glObjRedFlame.getElementById(strBadgeId);
                //main処理
                if (objBdgDom !== null) { //badgeがすでにある場合innerTextのみ変更
                    objBdgDom.innerText = intBadgeNum;
                    objBdgDom = glObjMaskFlame.getElementById(strBadgeId);
                    objBdgDom.innerText = intBadgeNum;
                } else { //ない場合追加

                    //badge追加
                    strBaseTop = doc.getClientRects()[0].top + objSvgDom.getClientRects()[0].top * (10 / 7) - 20 + "px";
                    strBaseLeft = doc.getClientRects()[0].x + objSvgDom.getClientRects()[0].x + 20 + "px";

                    var dispFlag = document.getElementById("badgeOn").checked;
                    var strDispStyle = dispFlag ? 'display:block' : 'display:none';
                    strRedBdgOuter = RED_BADGE_INIT + strBaseId + "' style='top:" + strBaseTop + ";left:" + strBaseLeft + ";" + strDispStyle + "'>" + intBadgeNum + '</span>';
                    strMskBdgOuter = MSK_BADGE_INIT + strBaseId + "' style='top:" + strBaseTop + ";left:" + strBaseLeft + ";" + strDispStyle + "'>" + intBadgeNum + '</span>';

                    strRedMakeOuter += strRedBdgOuter;
                    strMskMakeOuter += strMskBdgOuter;
                } //if
                intBadgeNum++;
            }//for
        } //for
    } //for

    //最後に埋め込み
    glObjRedFlame.body.innerHTML = glObjRedFlame.body.innerHTML + strRedMakeOuter;
    glObjMaskFlame.body.innerHTML = glObjMaskFlame.body.innerHTML + strMskMakeOuter;
} //function

/**
 * badgeを削除するメソッド
 */
function deleteBadge(tgtID) {
    var strBaseId = tgtID.substr(3, tgtID.length); //マスクのスパンを引き当てるのに使用
    var strBadgeId = 'bdg' + strBaseId;
    var objBdgDom = glObjRedFlame.getElementById(strBadgeId);
    objBdgDom.remove();
    objBdgDom = glObjMaskFlame.getElementById(strBadgeId);
    objBdgDom.remove();
}// function

/**
 * すべてのbadgeを削除するメソッド
 */
function deleteBadgeAll() {
    var objRedBudges = glObjRedFlame.getElementsByClassName('redNumber');
    var arrBadgeIds = [];
    //オブジェクトを削除すると要素カウントが少なくなるのでIDだけ先取得
    for (let i = 0; i < objRedBudges.length; i++) {
        arrBadgeIds[i] = objRedBudges[i].id;
    } //for


    for (let i = 0; i < arrBadgeIds.length; i++) {
        var strBadgeId = arrBadgeIds[i];
        var objBdgDom = glObjRedFlame.getElementById(strBadgeId);
        if (objBdgDom) {
            objBdgDom.remove();
        } //if
        objBdgDom = glObjMaskFlame.getElementById(strBadgeId);
        if (objBdgDom) {
            objBdgDom.remove();
        }  //if
    } //for

    //objectタグの対応


}// function

/**
 * badgeの表示・非表示を切替えるメソッド
 */
function changeBadge() {
    //badgeすべて削除
    deleteBadgeAll();
    var badage = document.getElementsByName("badgeOnOff");
    var redNumberList = glObjRedFlame.getElementsByClassName('redNumber');
    if (redNumberList.length == 0) {
        return false;
    }
    for (var i = 0; i < badage.length; i++) {
        if (badage[i].checked) {
            var redEle = glObjRedFlame.getElementsByClassName('redNumber');
            var mskEle = glObjMaskFlame.getElementsByClassName('mskNumber');
            if (badage[i].value === 'on') {
                for (var idx = 0; idx < redNumberList.length; idx++) {
                    redEle[idx].style.display = 'block';
                    mskEle[idx].style.display = 'block';
                }
            } else {
                for (var idx = 0; idx < redNumberList.length; idx++) {
                    redEle[idx].style.display = 'none';
                    mskEle[idx].style.display = 'none';
                }
            }
        }
    }
}
// 20200212
/**
 * objectタグの中を入れ替える
 */
async function exchangeObjectElement() {
    console.log("exchangeObjectElement start");
    //ojject要素がある場合埋め込み
    // 20200129 iframe内objectタグにもコンテキストメニューを仕込む
    glObjRedInDocs = glObjRedFlame.getElementsByTagName("object");
    glObjMskInDocs = glObjMaskFlame.getElementsByTagName("object");
    if (glObjRedInDocs.length < 1) {//object要素が無いHTMLの場合return
        return;
    }// if
    var blRet = false;
    //loopSleep内でObjectタグが表示されるまでobjAddEventをループ
    await loopSleep(50, 100, function (i) {
        if (blRet) {
            // breakと同等
            console.log("objAddEvent Success");
            return false;
        } //if
        blRet = objAddEvent();
    });
    console.log("exchangeObjectElement end");

} //function

/**
 * Objectタグに再度イベントリスナーを追加する関数(exchangeObjectElementから呼ぶ)
 * @param {boolean} 実行の成否
 */
function objAddEvent() {

    var objRedTmp = glObjRedInDocs[glObjRedInDocs.length - 1];//最後のobject要素
    var objMskTmp = glObjMskInDocs[glObjMskInDocs.length - 1];//最後のobject要素
    var objRedInDocSvg = objRedTmp.getSVGDocument();
    var objMskInDocSvg = objMskTmp.getSVGDocument();
    if (!objRedTmp) return false;
    if (!objMskTmp) return false;
    if (!objRedInDocSvg) return false;
    if (!objMskInDocSvg) return false;
    if (!objRedInDocSvg.documentElement) return false;
    if (!objMskInDocSvg.documentElement) return false;

    var strRedTagName = "red";
    for (let i = 0; i < glObjRedInDocs.length; i++) {
        //svgタグの場合
        var objRedTmp = glObjRedInDocs[i];
        objRedInDocSvg = objRedTmp.getSVGDocument();
        if (objRedInDocSvg.getRootNode() !== undefined) {
            //svgタグ以下にid付与(red)
            if (i == 0) glIdCnt = glRedSvgIdCnt + 1;
            allIdPut(objRedInDocSvg.documentElement, strRedTagName);

            objRedInDocSvg.oncontextmenu = function () { //デフォルト無効
                return false;
            }; //function
            objRedInDocSvg.addEventListener("mousedown", mouseDownAct, false);
            objRedInDocSvg.addEventListener('mouseup', mouseUpAct, false);
            objRedInDocSvg.addEventListener('contextmenu', contextFunc, false);
            objRedInDocSvg.addEventListener('mouseover', mouseOverAct, false);
            objRedInDocSvg.addEventListener('mouseout', mouseOutAct, false);

            glObjRedInSvg[i] = objRedInDocSvg;
        } //if
    } //if
    var strMskTagName = "msk";

    for (let i = 0; i < glObjMskInDocs.length; i++) {
        //svgタグの場合
        var objMskTmp = glObjMskInDocs[i];
        objMskInDocSvg = objMskTmp.getSVGDocument();
        if (objMskInDocSvg.getRootNode() !== undefined) {
            if (i == 0) glIdCnt = glMskSvgIdCnt + 1;
            console.log("msk" + i);
            console.log(objMskInDocSvg.documentElement);
            allIdPut(objMskInDocSvg.documentElement, strMskTagName);
            glObjMskInSvg[i] = objMskInDocSvg;
        } //if
    }//for
    return true;

} //function

/**
 * 再帰Timeout実行用関数
 * @param {Number} intLoopLimit ループ回数
 * @param {Number} intInterVal 待機時間(ms)
 * @param {*} mainFunc 繰り返し実行する関数
 */
async function loopSleep(intLoopLimit, intInterVal, mainFunc) {
    var i = 0;

    return new Promise(function (resolve) {
        var loopFunc = function () {
            var result = mainFunc(i);
            if (result === false) {
                // break機能
                resolve();
                return;
            }
            i = i + 1;
            if (i < intLoopLimit) {
                setTimeout(loopFunc, intInterVal);
            } //if
        } //function
        loopFunc();
    });


} //function



// 20200204 add
/**
 * ポリシー選択ボタン押下時の処理メソッド
 * @returns
 */
function selectPolicy() {

    var blRet = false;
    blRet = isPolicyBtn();
    if (blRet) {
        return;
    } //if
    window.MaskMain = {

        /**
         * 子画面終了後のコールバック関数
        * 画面を制御可能に変更する
        */
        afterChildClose: function () {
            document.getElementById("screen").style.display = "none";

        },

        /**
         * 子画面開始時のコールバック関数
         * 画面を制御不可に変更する。
         */
        beforeChildOpen: function () {
            document.getElementById("screen").style.display = "block";
        },

        /**
         * 子画面開始時のコールバック関数
         * 画面を制御不可に変更する。
         */
        afterConfirm: function (selectPolicy) {
            document.getElementById("screen").style.display = "none";
            var objForm = document.createElement('form');
            var objReq = document.createElement('input');
            var objReq2 = document.createElement('input');
            objForm.method = 'POST';
            objForm.action = "MaskHtmlCnt";

            objReq.type = 'text'; //入力フォームが表示されないように
            objReq.name = 'documentId';
            objReq.value = glDocumentId;

            objReq2.type = 'hidden'; //入力フォームが表示されないように
            objReq2.name = 'strPolicyList';
            objReq2.value = selectPolicy;

            objForm.appendChild(objReq);
            objForm.appendChild(objReq2);

            document.body.appendChild(objForm);

            //POST送信フラグを「true」に設定
            $("#top").select();
            isPost = true;

            objForm.submit();
        }
    };

    window.open('../PolicyHtmlCnt?policySelect=' + glPolicySelect, null, 'width=500,toolbar=yes,menubar=yes,scrollbars=yes');


}//function

/**
 * SVGファイル保存処理
 * @function
 */
function saveSvg() {

    $("#top").select();
    var strMaskHtml = glObjMaskFlame.body.outerHTML;
    var strRedHtml = glObjRedFlame.body.outerHTML;
    var arrTmpDir = [glStrTmpDir];
    var arrStrRedHtml = [strRedHtml];
    var arrStrMaskHtml = [strMaskHtml];
    var arrStrFileName = [glFileName];
    var arrdocumentId = [glDocumentId];

    //svgファイル対応
    if (glDocumentInfoLists[0].extension === "pdf" || glDocumentInfoLists[0].extension.indexOf("xls") >= 0 || glDocumentInfoLists[0].extension.indexOf("ppt") >= 0) {
        //svgデータを上書きする
        var svgRedVal = [];
        var svgRedSrc = [];
        var svgMskVal = [];
        var svgMskSrc = [];

        for (let i = 0; i < glObjRedInDocs.length; i++) {
            var strTgtId = glObjRedInDocs[i].getSVGDocument().getElementsByTagName("svg")[0].id;
            var strSvgVal = glObjRedInDocs[i].getSVGDocument().getElementById(strTgtId).outerHTML;
            svgRedVal[i] = strSvgVal;

            var strSrc = glObjRedInDocs[i].getElementsByTagName("embed")[0].src;
            svgRedSrc[i] = strSrc.substr(strSrc.lastIndexOf("/") + 1, strSrc.length);

            //msk
            strTgtId = glObjMskInDocs[i].getSVGDocument().getElementsByTagName("svg")[0].id;
            strSvgVal = glObjMskInDocs[i].getSVGDocument().getElementById(strTgtId).outerHTML;
            svgMskVal[i] = strSvgVal;
            strSrc = glObjMskInDocs[i].getElementsByTagName("embed")[0].src;
            svgMskSrc[i] = strSrc.substr(strSrc.lastIndexOf("/") + 1, strSrc.length);
        } //for

        var HashJson = {
            'tmpDir': arrTmpDir,
            'strRedHtml': arrStrRedHtml,
            'strMaskHtml': arrStrMaskHtml,
            'strFileName': arrStrFileName,
            'documentId': arrdocumentId,
            'glArrBfIds': glArrBfIds,
            'glArrAfIds': glArrAfIds,
            'glArrPolicys': glArrPolicys,
            'glRemarks': glRemarks,
            'svgRedVal': svgRedVal,
            'svgRedSrc': svgRedSrc,
            'svgMskVal': svgMskVal,
            'svgMskSrc': svgMskSrc
        };

        $.ajax({
            type: 'POST',
            url: 'blackpaint/WriteSvgRest',
            data: '[' + JSON.stringify(HashJson) + ']', //連想配列をJSONに変換
            dataType: "json",
            processData: false, // Ajaxがdataを整形しない指定
            contentType: false, // contentTypeもfalseに指定(Fileをアップロード時は必要)
            async: false, //非同期false
            success: function (retData) {
                console.log("success");
                return false;
            }, //function
            error: function (e) {
                console.log("fail");
                alert("SVGデータ上書き失敗しました。\r\n" + "エラーコード" + retData);
                return false;
            } //function
        }); //ajax


    }//if

} //function

//20200228 紐づけ対応
/**
 * 紐づけ時初期動作関数
 */
async function LinkInit() {

    //iframeが呼ばれるまでloopSleepをループ
    var blRet = false;
    await loopSleep(50, 100, function (i) {
        if (blRet) {
            // breakと同等
            console.log("waitIframe Success");
            return false;
        } //if
        blRet = waitIframe();
    });
    console.log("waitIframe end");


    $("#top").select();
    $.ajax({
        type: 'POST',
        url: 'blackpaint/LinkOpen',
        data: glDocumentId,
        dataType: "json",
        processData: false, // Ajaxがdataを整形しない指定
        contentType: false, // contentTypeもfalseに指定(Fileをアップロード時は必要)
        async: false, //非同期false
        success: function (retData) {
            console.log("success");
            $("#top").select();

            //gl変数初期化
            glArrBfIds = []; //黒塗り先頭ID
            glArrAfIds = []; //黒塗り終了ID
            glArrPolicys = []; //黒塗り対象のIDに紐づくポリシーID
            glArrRepOuter = []; //黒塗り候補変更後のOuterHtml
            glRemarks = []; //黒塗りリストの備考
            if (retData != null) {
                for (let i = 0; i < retData.length; i++) {
                    glArrBfIds[i] = retData[i].markerStartCd;
                    glArrAfIds[i] = retData[i].markerEndCd;
                    glArrPolicys[i] = retData[i].markerPolicy;
                    glRemarks[i] = retData[i].markerRemarks;
                } //for
            } //if
            //黒塗り箇所範囲選択用のOuterHtmlを作成する
            makeMaskOuter();
            // マスク番号一旦削除
            deleteBadgeAll();
            //20200302 IDの再採番をメソッド化
            getLastId();

            //AIポリシーはハイフン(なし)
            document.getElementById('AI_Policy').innerHTML = "-";

            return false;
        }, //function
        error: function (e) {
            console.log("fail");
            return false;
        } //function
    }); //ajax


} //function

/**
 * Iframeが呼ばれるまで処理を待つ
 * @param {boolean} 実行の成否
 */
function waitIframe() {

    getDocumentInfo(glDocumentId);
    var extension = glDocumentInfoLists[0].extension;

    if (extension === 'txt' || (extension.indexOf('doc') >= 0)) { //textとwordで処理分け
        if (!glObjRedFlame) return false;
        if (!glObjRedBody) return false;
        if (!glObjMaskFlame) return false;
        if (!glObjMaskBody) return false;

    } else {
        if (glObjRedInDocs.length === 0) { //objectタグがない場合
            if (!glObjRedFlame) return false;
            if (!glObjRedBody) return false;
            if (!glObjMaskFlame) return false;
            if (!glObjMaskBody) return false;
        } else {
            var objRedTmp = glObjRedInDocs[glObjRedInDocs.length - 1];//最後のobject要素
            var objMskTmp = glObjMskInDocs[glObjMskInDocs.length - 1];//最後のobject要素
            if (!objRedTmp) return false;
            if (!objMskTmp) return false;
        } //if

    } //if
    var objTgtFlame = document.getElementById("red").contentDocument;
    var objTgtBody = document.getElementById("red").contentDocument.body;
    if (!objTgtFlame) return false;
    if (!objTgtBody) return false;
    objTgtFlame = document.getElementById("red").contentDocument;
    objTgtBody = document.getElementById("red").contentDocument.body;
    if (!objTgtFlame) return false;
    if (!objTgtBody) return false;

    return true;

} //function

/**
 * IDの再採番を行う
 */
function getLastId() {
    for (let i = 0; i < glArrAfIds.length; i++) {
        var objEndCnt = glArrAfIds[i];
        tagRedIdCnt = parseInt(objEndCnt.substring(3));
        if (tagRedIdCnt - 2000000 < 0 //svgのidは除く
            && tagRedIdCnt >= glRedIdCnt) {
            glRedIdCnt = tagRedIdCnt + 1;
            glMaskIdCnt = tagRedIdCnt + 1;
        }
    } //
} //function



