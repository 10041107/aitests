// 'kr'로 시작하는 카테고리에 속하는 데이터만 선택합니다.
// 선택한 데이터를 무작위로 섞습니다.
// 섞인 데이터에서 50개를 선택합니다.
// 선택한 50개의 데이터를 5번에 걸쳐 10개씩 분할하여 사용합니다.


// ================================ 

// .env키 호출
import { config } from 'dotenv';
config();
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";


// node-fetch 호출
import('node-fetch').then(({ default: fetch }) => {
    // 배열 섞기 함수
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // db에 저장된 뉴스 데이터 호출
    fetch('http://localhost:8080/api/news/allNews')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(async data => { // 비동기 함수로 전환
            // kr 카테고리만 불러온다.
            const validData = data.filter(item => item.category.startsWith('kr'));

            // 데이터를 무작위로 섞음
            shuffleArray(validData);

            // 5개의 문단을 저장할 변수를 배열로 선언
            let summaryArray = [];

            // 50개를 불러온 데이터를 5번에 걸쳐 10개씩 출력
            for (let i = 0; i < 5; i++) {
                let summary = '';
                let totalLength = 0;

                for (let j = 0; j < 10; j++) {
                    const item = validData[i * 10 + j];
                    let truncatedTitle = item.title.substring(0, 100); // 데이터 '타이틀' 호출. 한번 호출에 100자까지
                    // 불러온 모든 데이터의 글자 수를 500개로 제한
                    if (totalLength + truncatedTitle.length <= 500) {
                        summary += truncatedTitle + '\n';
                        totalLength += truncatedTitle.length;
                    } else {
                        break;
                    }
                }
                // 요약된 내용을 배열에 저장
                summaryArray[i] = summary;
            }

            // 저장된 문단을 콘솔에 출력하고, 각 문단을 ChatOpenAI로 전달
            for (let i = 0; i < summaryArray.length; i++) {
                console.log(`${summaryArray[i]}\n`);

                const model = new ChatOpenAI({});

                // ChatOpenAI 호출
                const promptTemplate = PromptTemplate.fromTemplate(
                    "상단 내용을 바탕으로 오늘의 이슈 요약본을 작성해라.\n다섯 문단으로 나누어져 있어야 하고,\n글자 개수는 반드시 한국어 2000자 이상이어야 한다.\n~습니다. 입니다. 로 끝나는 존칭이 담긴 정중한 어투여야 하고, 친절하게 말해야 한다.\n인사와 날짜는 생략하고 본론만 이야기 해야 한다.\n주제의 끝 마다 /n/n을 작성해 단락을 끊어야 한다. Answer in Korean.\n=======\n{subject}"
                );

                const chain = promptTemplate.pipe(model);
                const result = await chain.invoke({
                    subject: summaryArray[i]
                });

                console.log(result);

                 // 각 요청 사이에 잠시 대기
                await new Promise(resolve => setTimeout(resolve, 5000)); // 5초

            }
        })
        // 오류: 불러 올 뉴스 데이터가 없을 시
        .catch((error) => {
            console.error(error);
            console.log("뉴스 정보를 불러오는데 실패했습니다.");
        });
});




// 50개 기사 10개씩 분할출력하기
// ================================ 

// // .env키 호출
// import { config } from 'dotenv';
// config();

// // node-fetch 호출
// import('node-fetch').then(({ default: fetch }) => {
//     // 배열 섞기 함수
//     function shuffleArray(array) {
//         for (let i = array.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             [array[i], array[j]] = [array[j], array[i]];
//         }
//     }

//     // db에 저장된 뉴스 데이터 호출
//     fetch('http://localhost:8080/api/news/allNews')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error("HTTP error " + response.status);
//             }
//             return response.json();
//         })
//         .then(data => {
//             // kr 카테고리만 불러온다.
//             const validData = data.filter(item => item.category.startsWith('kr'));

//             // 데이터를 무작위로 섞음
//             shuffleArray(validData);

//             // 50개를 불러온 데이터를 5번에 걸쳐 10개씩 출력
//             for (let i = 0; i < 5; i++) {
//                 let summary = '';
//                 let totalLength = 0;

//                 for (let j = 0; j < 10; j++) {
//                     const item = validData[i * 10 + j];
//                     let truncatedTitle = item.title.substring(0, 100); // 데이터 '타이틀' 호출. 한번 호출에 100자까지
//                     // 불러온 모든 데이터의 글자 수를 500개로 제한
//                     if (totalLength + truncatedTitle.length <= 500) {
//                         summary += truncatedTitle + '\n';
//                         totalLength += truncatedTitle.length;
//                     } else {
//                         break;
//                     }
//                 }
//                 // 요약된 내용 출력
//                 console.log(`출력 ${i + 1}:\n${summary}\n`);
//             }
//         })
//         // 오류: 불러 올 뉴스 데이터가 없을 시
//         .catch(() => {
//             console.log("뉴스 정보를 불러오는데 실패했습니다.");
//         });
// });



// ==================================





// npm install langchain
// npm install @langchain/openai
// npm i dotenv

// node.js 프로젝트에서 ES6 import/export문법을 사용하려면
// package.json파일에"type": "module"`을 추가해야 합니다.


// // .env키 호출
// import { config } from 'dotenv';
// config();

// // langchain 호출
// import { ChatOpenAI } from "langchain/chat_models/openai";
// import { PromptTemplate } from "langchain/prompts";


// // db에 저장된 뉴스 데이터 호출
// import('node-fetch').then(({ default: fetch }) => {
//     fetch('http://localhost:8080/api/news/allNews')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error("HTTP error " + response.status);
//             }
//             return response.json();
//         })
//         .then(async data => {
//             let summary = '';
//             // kr 카테고리만 불러온다.
//             const validCategories = ['kr_total', 'kr_business', 'kr_entertainment', 'kr_general', 'kr_health', 'kr_science', 'kr_sports', 'kr_technology'];
//             let totalLength = 0;

//             for (const item of data) {
//                 if (validCategories.includes(item.category)) {
//                     let truncatedTitle = item.title.substring(0, 100); // 데이터 '타이틀' 호출. 한번 호출에 100자까지
//                     // 불러온 모든 데이터의 글자 수를 2000개로 제한
//                     if (totalLength + truncatedTitle.length <= 2000) {
//                         summary += truncatedTitle + '\n';
//                         totalLength += truncatedTitle.length;
//                     } else {
//                         break;
//                     }
//                 }
//             }

//             // ChatOpenAI 호출
//             const model = new ChatOpenAI({});
//             // 프롬포트 삽입
                // const promptTemplate = PromptTemplate.fromTemplate(
                //     "상단 내용을 바탕으로 오늘의 이슈 요약본을 작성해라.
                //     다섯 문단으로 나누어져 있어야 하고,
                //     글자 개수는 반드시 한국어 2000자 이상이어야 한다. 
                //     ~습니다. 입니다. 로 끝나는 존칭이 담긴 정중한 어투여야 하고, 친절하게 말해야 한다.
                //     인사와 날짜는 생략하고 본론만 이야기 해야 한다. 
                //     주제의 끝 마다 /n/n을 작성해 단락을 끊어야 한다.  Answer in Korean.\n=======\n{subject}"
                // ); 
//             const chain = promptTemplate.pipe(model);
//             const result = await chain.invoke({
//                 subject: summary
//             });
//             // 출력 결과가 나오면 ',' 로 단어를 분할하고, 글자수가 10개가 넘는 단어는 제거한다.
//             console.log(result.content.split(', ').filter(word => word.length < 10));

//         })
//         // 오류: 불러 올 뉴스 데이터가 없을 시
//         .catch(() => {
//             console.log("뉴스 정보를 불러오는데 실패했습니다.");
//         });
// });

