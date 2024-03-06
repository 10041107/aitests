// allNews API 중 제목 데이터(kr카테고리 한정)만 불러와 통합하고,
// text to text AI를 이용해 키워드를 10~15개 출력합니다.
// ================================ 


// npm install langchain
// npm install @langchain/openai
// npm i dotenv

// node.js 프로젝트에서 ES6 import/export문법을 사용하려면
// package.json파일에"type": "module"`을 추가해야 합니다.


// .env키 호출
import { config } from 'dotenv';
config();

// langchain 호출
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";


// db에 저장된 뉴스 데이터 호출
import('node-fetch').then(({ default: fetch }) => {
    fetch('http://localhost:8080/api/news/allNews')
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(async data => {
            let summary = '';
            // kr 카테고리만 불러온다.
            const validCategories = ['kr_total', 'kr_business', 'kr_entertainment', 'kr_general', 'kr_health', 'kr_science', 'kr_sports', 'kr_technology'];
            let totalLength = 0;

            for (const item of data) {
                if (validCategories.includes(item.category)) {
                    let truncatedTitle = item.title.substring(0, 100); // 데이터 '타이틀' 호출. 한번 호출에 100자까지
                    // 불러온 모든 데이터의 글자 수를 2000개로 제한
                    if (totalLength + truncatedTitle.length <= 2000) {
                        summary += truncatedTitle + '\n';
                        totalLength += truncatedTitle.length;
                    } else {
                        break;
                    }
                }
            }

            // ChatOpenAI 호출
            const model = new ChatOpenAI({});
            // 프롬포트 삽입
            const promptTemplate = PromptTemplate.fromTemplate(
                "하단의 내용 중에서 가장 인기 많은 핫토픽 키워드를 15개 추출해라. Answer in Korean.\n=======\n{subject}"
            ); 
            const chain = promptTemplate.pipe(model);
            const result = await chain.invoke({
                subject: summary
            });
            // 출력 결과가 나오면 ',' 로 단어를 분할하고, 글자수가 10개가 넘는 단어는 제거한다.
            console.log(result.content.split(', ').filter(word => word.length < 10));

        })
        // 오류: 불러 올 뉴스 데이터가 없을 시
        .catch(() => {
            console.log("뉴스 정보를 불러오는데 실패했습니다.");
        });
});

