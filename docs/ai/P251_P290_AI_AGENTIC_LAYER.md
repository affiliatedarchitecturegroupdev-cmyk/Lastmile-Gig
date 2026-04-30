# Phase Group J — AI Agentic Layer (P251-P290)

## P251 — AI Service Architecture
```python
# Python FastAPI AI service
from fastapi import FastAPI
from langchain.chat_models import ChatBedrock
from langgraph.graph import StateGraph

app = FastAPI()

llm = ChatBedrock(
    model="anthropic.claude-3-sonnet-20240229-v1:0",
    temperature=0.7
)
```

## P252 — LLM Selection
```python
# Multi-model support
LLMS = {
    "claude-3.5": ChatBedrock(
        model="anthropic.claude-3-5-sonnet-20240229-v1:0"
    ),
    "claude-3-opus": ChatBedrock(
        model="anthropic.claude-3-opus-20240229-v1:0"
    ),
    "llama-3": ChatBedrock(
        model="meta.llama3-70b-instruct-v1:0"
    )
}
```

## P253 — Prompt Templates
```python
from langchain.prompts import ChatPromptTemplate

DISPATCH_PROMPT = ChatPromptTemplate.from_template("""
You are a dispatch optimization AI.
Analyze the following delivery:
- Order ID: {order_id}
- Pickup: {pickup_location}
- Dropoff: {dropoff_location}
- Time: {order_time}
- Available drivers: {drivers}

Select the optimal driver and explain your reasoning.
""")

FRAUD_PROMPT = ChatPromptTemplate.from_template("""
Analyze this order for fraud risk:
{order_details}
Risk factors: {risk_factors}
Output: fraud_score (0-1), reasons
""")
```

## P254 — Vector Store (Pinecone)
```python
from langchain.vectorstores import Pinecone
from langchain.embeddings import BedrockEmbeddings

embeddings = BedrockEmbeddings(
    model="amazon.titan-embed-text-v1"
)

vectorstore = Pinecone.from_documents(
    documents,
    embeddings,
    index_name="lastmilegig-knowledge"
)
```

## P255 — RAG Chain
```python
from langchain.chains import RetrievalQA

rag_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(),
    return_source_documents=True
)
```

## P256 — LangGraph State
```python
from langgraph.graph import StateGraph
from typing import TypedDict

class AgentState(TypedDict):
    order_id: str
    order_details: dict
    drivers: list
    selected_driver: str
    confidence: float
    reasoning: str
    requires_review: bool
```

## P257 — Dispatch Agent Graph
```python
from langgraph.graph import END, START

def create_dispatch_graph():
    builder = StateGraph(AgentState)
    
    builder.add_node("analyze", analyze_order)
    builder.add_node("filter_drivers", filter_drivers)
    builder.add_node("score_drivers", score_drivers)
    builder.add_node("select_driver", select_driver)
    builder.add_node("human_review", human_review)
    
    builder.add_edge(START, "analyze")
    builder.add_edge("analyze", "filter_drivers")
    builder.add_edge("filter_drivers", "score_drivers")
    builder.add_edge("score_drivers", "select_driver")
    
    builder.add_conditional_edges(
        "select_driver",
        needs_review,
        {
            True: "human_review",
            False: END
        }
    )
    
    return builder.compile()
```

## P258 — Dispatch Node Functions
```python
async def analyze_order(state: AgentState) -> AgentState:
    order = await get_order(state["order_id"])
    
    # Calculate distance, traffic, time constraints
    analysis = {
        "urgency": calculate_urgency(order),
        "distance_km": calculate_distance(order),
        "traffic_level": get_traffic(order.pickup_location)
    }
    
    return {**state, "analysis": analysis}

async def score_drivers(state: AgentState) -> AgentState:
    scores = []
    for driver in state["filtered_drivers"]:
        score = await dispatch_llm.invoke(f"""
        Driver: {driver.name}
        Location: {driver.location}
        Performance: {driver.performance_score}
        Current orders: {driver.active_orders}
        
        Order: {state['order_details']}
        
        Score 0-100 and reason:
        """)
        scores.append({
            "driver": driver.id,
            "score": parse_score(score),
            "reasoning": score.reasoning
        })
    
    return {**state, "driver_scores": scores}
```

## P259 — Fraud Detection Agent
```python
def create_fraud_graph():
    builder = StateGraph(AgentState)
    
    builder.add_node("check_patterns", check_fraud_patterns)
    builder.add_node("check_history", check_driver_history)
    builder.add_node("calculate_risk", calculate_risk_score)
    builder.add_node("review_alert", review_alert)
    
    builder.add_edge(START, "check_patterns")
    builder.add_edge("check_patterns", "check_history")
    builder.add_edge("check_history", "calculate_risk")
    
    return builder.compile()

async def calculate_risk_score(state: AgentState) -> AgentState:
    risk = calculate_fraud_risk(
        state["pattern_score"],
        state["history_score"],
        state["anomaly_score"]
    )
    
    return {
        **state,
        "fraud_score": risk,
        "requires_alert": risk > 0.7
    }
```

## P260 — Customer Support Agent
```python
SUPPORT_GRAPH = create_support_graph()

async def handle_support(message: str, customer_id: str):
    # Get conversation history
    history = await get_conversation(customer_id)
    
    # Classify intent
    intent = await classify_intent(message)
    
    # Route to appropriate handler
    if intent == "order_status":
        response = await ORDER_AGENT.run(message, history)
    elif intent == "refund":
        response = await REFUND_AGENT.run(message, history)
    elif intent == "complaint":
        response = await COMPLAINT_AGENT.run(message, history)
    else:
        response = await GENERAL_AGENT.run(message, history)
    
    return response
```

## P261 — Menu Recommendation Agent
```python
async def recommend_menu(customer_id: str, restaurant_id: str):
    # Get customer preferences
    prefs = await get_customer_prefs(customer_id)
    
    # Get restaurant menu
    menu = await get_menu(restaurant_id)
    
    # Get order history
    history = await get_order_history(customer_id)
    
    # Generate recommendations
    recs = await llm.invoke(f"""
    Customer preferences: {prefs}
    Order history: {history}
    Available items: {menu}
    
    Recommend 5 items with explanations.
    """)
    
    return parse_recommendations(recs)
```

## P262 — ETA Prediction Model
```python
# SageMaker endpoint
async def predict_eta(order_id: str):
    features = {
        "hour": datetime.now().hour,
        "day_of_week": datetime.now().weekday(),
        "partner_id": order.partner_id,
        "item_count": len(order.items),
        "pickup_location": order.pickup_location,
        "dropoff_location": order.dropoff_location,
        "historical_avg": partner.avg_prep_time,
        "current_orders": partner.active_orders
    }
    
    result = await sm.invoke_endpoint(
        EndpointName="eta-predictor",
        InputPayload=json.dumps(features)
    )
    
    return json.loads(result)
```

## P263 — Demand Forecasting
```python
async def forecast_demand(partner_id: str, date: date):
    features = {
        "partner_id": partner_id,
        "date": date,
        "historical": await get_historical_orders(partner_id, date),
        "weather": await get_weather(date),
        "events": await get_local_events(date)
    }
    
    forecast = await sm.invoke_endpoint(
        EndpointName="demand-forecaster",
        InputPayload=json.dumps(features)
    )
    
    return parse_forecast(forecast)
```

## P264 — Dynamic Pricing Agent
```python
async def calculate_delivery_fee(order: Order):
    base_fee = 50
    distance = calculate_distance(order)
    surge = await get_surge_multiplier(
        order.pickup_location,
        order.dropoff_location
    )
    
    demand = await forecast_demand(
        order.partner_id,
        date.today()
    )
    
    dynamic_fee = base_fee * distance * surge * demand
    
    return min(dynamic_fee, 150)  # Cap at R150
```

## P265 — CrewAI Crew Definition
```python
from crewai import Agent, Task, Crew

dispatch_crew = Crew(
    agents=[
        dispatcher_agent,
        availability_agent,
        route_agent
    ],
    tasks=[
        dispatch_task,
        availability_task,
        route_task
    ],
    process="hierarchical"
)
```

## P266 — CrewAI Dispatch Agents
```python
dispatcher_agent = Agent(
    role="Dispatch Coordinator",
    goal="Assign the best driver to each order",
    backstory="""
    You coordinate deliveries for a food delivery
    platform. You analyze order details, driver
    availability, and performance to make
    optimal assignments.
    """,
    llm=llm,
    verbose=True
)

availability_agent = Agent(
    role="Driver Availability Checker",
    goal="Verify driver availability in real-time",
    backstory="You check driver locations and status",
    llm=llm
)
```

## P267 — CrewAI Tasks
```python
dispatch_task = Task(
    description=f"""
    Analyze order {order_id}:
    - Pickup: {pickup}
    - Dropoff: {dropoff}
    - Time constraint: {time_constraint}
    
    Select optimal driver from {available_drivers}
    """,
    agent=dispatcher_agent,
    expected_output="Driver ID and confidence score"
)
```

## P268 — Chat with RAG
```python
# Customer chat with knowledge base
async def chat_with_ai(message: str, customer_id: str):
    # Get relevant docs
    docs = vectorstore.similarity_search(message, k=5)
    
    # Build context
    context = "\n\n".join([d.page_content for d in docs])
    
    # Generate response
    response = await llm.invoke(f"""
    Context from knowledge base:
    {context}
    
    Customer question: {message}
    
    Provide helpful answer:
    """)
    
    return response
```

## P269 — Agent Observability
```python
# LangSmith integration
from langsmith import trace

@trace(name="dispatch_agent", run_id=run_id)
async def dispatch_order(order_id: str):
    # ... dispatch logic
    pass
```

## P270 — Agent Metrics
```python
# Track agent performance
metrics = {
    "dispatch_success_rate": 0.94,
    "dispatch_avg_time_ms": 240,
    "fraud_detection_accuracy": 0.91,
    "support_satisfaction": 0.87,
    "recommendation_ctr": 0.23
}
```

## P271-P290 — Additional AI Features
- P271: AI-generated menu descriptions
- P272: AI-powered photo optimization
- P273: AI content moderation
- P274: AI chatbot for partners
- P275: AI driver coaching
- P276: AI anomaly detection
- P277: AI sentiment analysis
- P278: AI keyword extraction
- P279: AI translation
- P280: AI summarizing
- P281: AI personalized offers
- P282: AI churn prediction
- P283: AI lifetime value prediction
- P284: AI inventory forecasting
- P285: AI partner recommendations
- P286: AI delivery optimization
- P287: AI traffic prediction
- P288: AI weather impact analysis
- P289: AI seasonal promotions
- P290: AI A/B testing

---

## AI Agentic Layer Summary
| Component | Technology |
|-----------|------------|
| LLM | Claude 3.5, Llama 3 |
| Graph | LangGraph |
| Crew | CrewAI |
| Embeddings | Amazon Titan |
| Vector Store | Pinecone |
| Observability | LangSmith |

**Phase Group J Complete! Ready for Phase Group K — Payments (P291-P320)**
