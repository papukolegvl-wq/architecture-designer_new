import { VendorOption } from './components/GenericComponentConfigPanel'

export const orchestratorVendors: VendorOption[] = [
    { value: 'kubernetes', label: 'Kubernetes', description: 'Industry standard container orchestration' },
    { value: 'openshift', label: 'OpenShift', description: 'Enterprise Kubernetes by Red Hat' },
    { value: 'nomad', label: 'Nomad', description: 'Simpler orchestration by HashiCorp' },
    { value: 'docker-swarm', label: 'Docker Swarm', description: 'Native Docker orchestration' },
    { value: 'ecs', label: 'Amazon ECS', description: 'Elastic Container Service' },
    { value: 'eks', label: 'Amazon EKS', description: 'Elastic Kubernetes Service' },
    { value: 'aks', label: 'Azure AKS', description: 'Azure Kubernetes Service' },
    { value: 'gke', label: 'Google GKE', description: 'Google Kubernetes Engine' },
]

export const eventBusVendors: VendorOption[] = [
    { value: 'eventbridge', label: 'Amazon EventBridge', description: 'Serverless event bus' },
    { value: 'azure-event-grid', label: 'Azure Event Grid', description: 'Event routing service' },
    { value: 'google-eventarc', label: 'Google Eventarc', description: 'Eventing framework' },
    { value: 'solace', label: 'Solace PubSub+', description: 'Advanced event broker' },
    { value: 'kafka', label: 'Apache Kafka', description: 'Distributed event streaming' },
    { value: 'rabbitmq', label: 'RabbitMQ', description: 'Message broker' },
]

export const streamProcessorVendors: VendorOption[] = [
    { value: 'flink', label: 'Apache Flink', description: 'Stateful computations over data streams' },
    { value: 'spark-streaming', label: 'Spark Streaming', description: 'Scalable stream processing' },
    { value: 'kafka-streams', label: 'Kafka Streams', description: 'Client library for building applications' },
    { value: 'kinesis-analytics', label: 'Kinesis Data Analytics', description: 'Analyze data streams with SQL' },
    { value: 'storm', label: 'Apache Storm', description: 'Real-time computation system' },
    { value: 'samza', label: 'Apache Samza', description: 'Distributed stream processing' },
]

export const searchEngineVendors: VendorOption[] = [
    { value: 'elasticsearch', label: 'Elasticsearch', description: 'Distributed search and analytics' },
    { value: 'opensearch', label: 'OpenSearch', description: 'Open source search and analytics' },
    { value: 'solr', label: 'Apache Solr', description: 'Open source enterprise search' },
    { value: 'algolia', label: 'Algolia', description: 'Search-as-a-Service' },
    { value: 'meilisearch', label: 'Meilisearch', description: 'Lightning-fast search engine' },
]

export const graphDatabaseVendors: VendorOption[] = [
    { value: 'neo4j', label: 'Neo4j', description: 'Graph database management system' },
    { value: 'amazon-neptune', label: 'Amazon Neptune', description: 'Managed graph database' },
    { value: 'azure-cosmos-gremlin', label: 'Cosmos DB (Gremlin)', description: 'Azure Graph API' },
    { value: 'tigergraph', label: 'TigerGraph', description: 'Fast graph analytics' },
    { value: 'janusgraph', label: 'JanusGraph', description: 'Distributed graph database' },
]

export const timeSeriesDatabaseVendors: VendorOption[] = [
    { value: 'influxdb', label: 'InfluxDB', description: 'Purpose-built for time series data' },
    { value: 'prometheus', label: 'Prometheus', description: 'Monitoring system and time series DB' },
    { value: 'timescaledb', label: 'TimescaleDB', description: 'PostgreSQL for time series' },
    { value: 'victoriametrics', label: 'VictoriaMetrics', description: 'Fast, cost-effective monitoring' },
    { value: 'questdb', label: 'QuestDB', description: 'Fastest open source time series database' },
]

export const serviceMeshVendors: VendorOption[] = [
    { value: 'istio', label: 'Istio', description: 'Open platform to connect services' },
    { value: 'linkerd', label: 'Linkerd', description: 'Ultralight service mesh' },
    { value: 'consul', label: 'Consul Connect', description: 'Service segmentation' },
    { value: 'aws-app-mesh', label: 'AWS App Mesh', description: 'App-level networking' },
    { value: 'kuma', label: 'Kuma', description: 'Universal service mesh' },
]

export const configurationManagementVendors: VendorOption[] = [
    { value: 'ansible', label: 'Ansible', description: 'Automation platform' },
    { value: 'chef', label: 'Chef', description: 'Infrastructure automation' },
    { value: 'puppet', label: 'Puppet', description: 'Configuration management' },
    { value: 'terraform', label: 'Terraform', description: 'Infrastructure as Code' },
    { value: 'saltstack', label: 'SaltStack', description: 'Event-driven automation' },
]

export const ciCdPipelineVendors: VendorOption[] = [
    { value: 'jenkins', label: 'Jenkins', description: 'Open source automation server' },
    { value: 'gitlab-ci', label: 'GitLab CI', description: 'Built-in CI/CD' },
    { value: 'github-actions', label: 'GitHub Actions', description: 'Native GitHub automation' },
    { value: 'circleci', label: 'CircleCI', description: 'Continuous integration and delivery' },
    { value: 'azure-devops', label: 'Azure Pipelines', description: 'CI/CD for any platform' },
    { value: 'argo-cd', label: 'Argo CD', description: 'Declarative GitOps CD for Kubernetes' },
]

export const identityProviderVendors: VendorOption[] = [
    { value: 'auth0', label: 'Auth0', description: 'Identity platform' },
    { value: 'okta', label: 'Okta', description: 'Enterprise identity' },
    { value: 'keycloak', label: 'Keycloak', description: 'Open source IAM' },
    { value: 'azure-ad', label: 'Microsoft Entra ID', description: 'Azure Active Directory' },
    { value: 'aws-cognito', label: 'Amazon Cognito', description: 'AWS Customer Identity' },
    { value: 'onelogin', label: 'OneLogin', description: 'Identity and access management' },
]

export const secretManagementVendors: VendorOption[] = [
    { value: 'hashicorp-vault', label: 'HashiCorp Vault', description: 'Manage secrets and protect data' },
    { value: 'aws-secrets-manager', label: 'AWS Secrets Manager', description: 'Rotate, manage, and retrieve secrets' },
    { value: 'azure-key-vault', label: 'Azure Key Vault', description: 'Safeguard cryptographic keys' },
    { value: 'google-secret-manager', label: 'Google Secret Manager', description: 'Secure storage' },
    { value: 'cyberark', label: 'CyberArk', description: 'Privileged access management' },
]

export const integrationPlatformVendors: VendorOption[] = [
    { value: 'mulesoft', label: 'MuleSoft', description: 'Integration platform' },
    { value: 'boomi', label: 'Dell Boomi', description: 'Cloud integration' },
    { value: 'snaplogic', label: 'SnapLogic', description: 'Intelligent integration' },
    { value: 'informatica', label: 'Informatica', description: 'Cloud data integration' },
    { value: 'workato', label: 'Workato', description: 'Enterprise automation' },
    { value: 'zapier', label: 'Zapier', description: 'Automation for everyone' },
]

export const etlServiceVendors: VendorOption[] = [
    { value: 'aws-glue', label: 'AWS Glue', description: 'Serverless data integration' },
    { value: 'azure-data-factory', label: 'Azure Data Factory', description: 'Hybrid data integration' },
    { value: 'google-dataflow', label: 'Google Dataflow', description: 'Unified stream and batch data processing' },
    { value: 'talend', label: 'Talend', description: 'Data integration platform' },
    { value: 'matillion', label: 'Matillion', description: 'Cloud-native ETL' },
    { value: 'informatica-powercenter', label: 'Informatica PowerCenter', description: 'Enterprise data integration' },
]

export const cdcServiceVendors: VendorOption[] = [
    { value: 'debezium', label: 'Debezium', description: 'Distributed platform for CDC' },
    { value: 'qlik-replicate', label: 'Qlik Replicate', description: 'Universal data replication' },
    { value: 'oracle-goldengate', label: 'Oracle GoldenGate', description: 'Real-time data mesh' },
    { value: 'aws-dms', label: 'AWS DMS', description: 'Database Migration Service' },
    { value: 'striim', label: 'Striim', description: 'Real-time data integration' },
]

export const lakehouseVendors: VendorOption[] = [
    { value: 'databricks', label: 'Databricks', description: 'Data Intelligence Platform' },
    { value: 'dremio', label: 'Dremio', description: 'Data Lakehouse Platform' },
    { value: 'starburst', label: 'Starburst', description: 'Analytics engine for data mesh' },
    { value: 'snowflake', label: 'Snowflake', description: 'Data Cloud' },
]

export const dataQualityVendors: VendorOption[] = [
    { value: 'great-expectations', label: 'Great Expectations', description: 'Data quality testing' },
    { value: 'soda', label: 'Soda', description: 'Data reliability' },
    { value: 'monte-carlo', label: 'Monte Carlo', description: 'Data observability' },
    { value: 'bigeye', label: 'Bigeye', description: 'Data monitoring' },
]

export const dataObservabilityVendors: VendorOption[] = [
    { value: 'monte-carlo', label: 'Monte Carlo', description: 'Data observability platform' },
    { value: 'databand', label: 'Databand', description: 'Observability for data engineering' },
    { value: 'metaplane', label: 'Metaplane', description: 'Data observability' },
    { value: 'anomalo', label: 'Anomalo', description: 'Automated data quality' },
]

export const metadataCatalogVendors: VendorOption[] = [
    { value: 'datahub', label: 'DataHub', description: 'Metadata platform' },
    { value: 'amundsen', label: 'Amundsen', description: 'Data discovery metadata engine' },
    { value: 'apache-atlas', label: 'Apache Atlas', description: 'Data governance and metadata' },
    { value: 'collibra', label: 'Collibra', description: 'Data intelligence cloud' },
    { value: 'alation', label: 'Alation', description: 'Data catalog' },
]

export const reverseEtlVendors: VendorOption[] = [
    { value: 'hightouch', label: 'Hightouch', description: 'Sync data to business tools' },
    { value: 'census', label: 'Census', description: 'Operational analytics' },
    { value: 'polytomic', label: 'Polytomic', description: 'Sync data anywhere' },
]

export const featureStoreVendors: VendorOption[] = [
    { value: 'feast', label: 'Feast', description: 'Open source feature store' },
    { value: 'tecton', label: 'Tecton', description: 'Enterprise feature store' },
    { value: 'hopsworks', label: 'Hopsworks', description: 'Feature store and MLOps' },
    { value: 'sagemaker-feature-store', label: 'SageMaker Feature Store', description: 'AWS Feature Store' },
]

export const dataLakeVendors: VendorOption[] = [
    { value: 's3', label: 'Amazon S3', description: 'Simple Storage Service' },
    { value: 'adls', label: 'Azure Data Lake Storage', description: 'Scalable data storage' },
    { value: 'gcs', label: 'Google Cloud Storage', description: 'Unified object storage' },
    { value: 'minio', label: 'MinIO', description: 'High performance object storage' },
    { value: 'hdfs', label: 'HDFS', description: 'Hadoop Distributed File System' },
]

export const mlAiServiceVendors: VendorOption[] = [
    { value: 'sagemaker', label: 'Amazon SageMaker', description: 'Build, train, and deploy models' },
    { value: 'vertex-ai', label: 'Vertex AI', description: 'Google Cloud AI platform' },
    { value: 'azure-ml', label: 'Azure Machine Learning', description: 'Enterprise-grade ML' },
    { value: 'datarobot', label: 'DataRobot', description: 'AI Cloud platform' },
    { value: 'h2o', label: 'H2O.ai', description: 'AI Cloud' },
]

export const notificationServiceVendors: VendorOption[] = [
    { value: 'sns', label: 'Amazon SNS', description: 'Simple Notification Service' },
    { value: 'twilio', label: 'Twilio', description: 'Communication APIs' },
    { value: 'onesignal', label: 'OneSignal', description: 'Customer engagement' },
    { value: 'firebase-fcm', label: 'Firebase Cloud Messaging', description: 'Cross-platform messaging' },
    { value: 'pusher', label: 'Pusher', description: 'Realtime features' },
]

export const emailServiceVendors: VendorOption[] = [
    { value: 'ses', label: 'Amazon SES', description: 'Simple Email Service' },
    { value: 'sendgrid', label: 'SendGrid', description: 'Email delivery' },
    { value: 'mailgun', label: 'Mailgun', description: 'Email API' },
    { value: 'postmark', label: 'Postmark', description: 'Transactional email' },
    { value: 'mailchimp', label: 'Mailchimp', description: 'Marketing platform' },
]

export const smsGatewayVendors: VendorOption[] = [
    { value: 'twilio', label: 'Twilio', description: 'SMS API' },
    { value: 'sns', label: 'Amazon SNS', description: 'SMS messaging' },
    { value: 'plivo', label: 'Plivo', description: 'Global SMS API' },
    { value: 'nexmo', label: 'Vonage (Nexmo)', description: 'Communication APIs' },
    { value: 'messagebird', label: 'MessageBird', description: 'Omnichannel communication' },
]

export const dnsServiceVendors: VendorOption[] = [
    { value: 'route53', label: 'Amazon Route 53', description: 'Scalable DNS' },
    { value: 'cloudflare', label: 'Cloudflare DNS', description: 'Fastest DNS' },
    { value: 'google-cloud-dns', label: 'Google Cloud DNS', description: 'Reliable DNS' },
    { value: 'azure-dns', label: 'Azure DNS', description: 'Hosting for DNS domains' },
    { value: 'ns1', label: 'NS1', description: 'Application traffic intelligence' },
]

export const serverVendors: VendorOption[] = [
    { value: 'linux', label: 'Linux Server', description: 'Ubuntu, CentOS, Debian' },
    { value: 'windows', label: 'Windows Server', description: 'Windows Server 2019/2022' },
    { value: 'bare-metal', label: 'Bare Metal', description: 'Physical server' },
    { value: 'vmware', label: 'VMware VM', description: 'Virtual Machine' },
    { value: 'ec2', label: 'Amazon EC2', description: 'Elastic Compute Cloud' },
    { value: 'gce', label: 'Google Compute Engine', description: 'VMs in Google Cloud' },
    { value: 'azure-vm', label: 'Azure VM', description: 'Virtual Machines' },
]

export const webServerVendors: VendorOption[] = [
    { value: 'nginx', label: 'NGINX', description: 'High performance web server' },
    { value: 'apache', label: 'Apache HTTP Server', description: 'Most popular web server' },
    { value: 'iis', label: 'IIS', description: 'Internet Information Services' },
    { value: 'caddy', label: 'Caddy', description: 'Web server with automatic HTTPS' },
    { value: 'tomcat', label: 'Apache Tomcat', description: 'Java Servlet Container' },
]

export const containerVendors: VendorOption[] = [
    { value: 'docker', label: 'Docker Container', description: 'Standard container' },
    { value: 'podman', label: 'Podman', description: 'Daemonless container engine' },
    { value: 'lxc', label: 'LXC', description: 'Linux Containers' },
    { value: 'containerd', label: 'containerd', description: 'Container runtime' },
]

export const internetGatewayVendors: VendorOption[] = [
    { value: 'aws-igw', label: 'AWS Internet Gateway', description: 'VPC Internet Gateway' },
    { value: 'azure-gateway', label: 'Azure VPN Gateway', description: 'High availability gateway' },
    { value: 'google-cloud-gateway', label: 'Google Cloud Gateway', description: 'Secure gateway' },
    { value: 'cisco', label: 'Cisco Router', description: 'Enterprise router' },
    { value: 'juniper', label: 'Juniper', description: 'High-performance networking' },
]

export const natGatewayVendors: VendorOption[] = [
    { value: 'aws-nat', label: 'AWS NAT Gateway', description: 'Managed NAT service' },
    { value: 'azure-nat', label: 'Azure NAT Gateway', description: 'Simplifies outbound connectivity' },
    { value: 'google-cloud-nat', label: 'Google Cloud NAT', description: 'Network address translation' },
    { value: 'pfsense', label: 'pfSense', description: 'Open source firewall/router' },
]

export const vpnGatewayVendors: VendorOption[] = [
    { value: 'openvpn', label: 'OpenVPN', description: 'VPN protocol' },
    { value: 'wireguard', label: 'WireGuard', description: 'Modern VPN' },
    { value: 'aws-vpn', label: 'AWS VPN', description: 'Client & Site-to-Site' },
    { value: 'azure-vpn', label: 'Azure VPN', description: 'Gateway' },
    { value: 'fortinet', label: 'Fortinet', description: 'Enterprise VPN' },
]

export const proxyVendors: VendorOption[] = [
    { value: 'nginx', label: 'NGINX Proxy', description: 'Reverse proxy' },
    { value: 'haproxy', label: 'HAProxy', description: 'High availability proxy' },
    { value: 'squid', label: 'Squid', description: 'Caching proxy' },
    { value: 'envoy', label: 'Envoy', description: 'Cloud-native proxy' },
    { value: 'traefik', label: 'Traefik', description: 'Modern reverse proxy' },
]

export const backupServiceVendors: VendorOption[] = [
    { value: 'aws-backup', label: 'AWS Backup', description: 'Centralized backup service' },
    { value: 'azure-backup', label: 'Azure Backup', description: 'Cloud backup' },
    { value: 'google-backup', label: 'Google Backup', description: 'Data protection' },
    { value: 'veeam', label: 'Veeam', description: 'Data protection solution' },
    { value: 'rubrik', label: 'Rubrik', description: 'Cloud data management' },
]

export const cdnVendors: VendorOption[] = [
    { value: 'cloudflare', label: 'Cloudflare', description: 'Global network' },
    { value: 'aws-cloudfront', label: 'CloudFront', description: 'AWS content delivery' },
    { value: 'akamai', label: 'Akamai', description: 'Edge platform' },
    { value: 'fastly', label: 'Fastly', description: 'Edge cloud platform' },
]

export const iotGatewayVendors: VendorOption[] = [
    { value: 'aws-iot-greengrass', label: 'AWS IoT Greengrass', description: 'Edge runtime' },
    { value: 'azure-iot-edge', label: 'Azure IoT Edge', description: 'Edge computing' },
    { value: 'kafka-connect', label: 'Kafka Connect', description: 'Data integration' },
    { value: 'hivemq', label: 'HiveMQ', description: 'MQTT broker' },
]

export const edgeComputingVendors: VendorOption[] = [
    { value: 'cloudflare-workers', label: 'Cloudflare Workers', description: 'Serverless at edge' },
    { value: 'lambda-edge', label: 'Lambda@Edge', description: 'Run code closer to users' },
    { value: 'vercel-edge', label: 'Vercel Edge', description: 'Frontend edge' },
    { value: 'fly-io', label: 'Fly.io', description: 'Global application platform' },
]

export const blockStorageVendors: VendorOption[] = [
    { value: 'ebs', label: 'AWS EBS', description: 'Elastic Block Store' },
    { value: 'azure-disk', label: 'Azure Disk', description: 'Managed Disks' },
    { value: 'gcp-pd', label: 'Google Persistent Disk', description: 'Reliable storage' },
    { value: 'ceph', label: 'Ceph', description: 'Distributed storage' },
]

export const fileStorageVendors: VendorOption[] = [
    { value: 'efs', label: 'AWS EFS', description: 'Elastic File System' },
    { value: 'azure-files', label: 'Azure Files', description: 'Managed file shares' },
    { value: 'gcp-filestore', label: 'Google Filestore', description: 'Managed NFS' },
    { value: 'glusterfs', label: 'GlusterFS', description: 'Scalable network filesystem' },
]

export const archiveStorageVendors: VendorOption[] = [
    { value: 'glacier', label: 'AWS Glacier', description: 'Archive storage' },
    { value: 'azure-archive', label: 'Azure Archive', description: 'Cool blob storage' },
    { value: 'gcp-archive', label: 'Google Archive', description: 'Long-term storage' },
]

export const llmVendors: VendorOption[] = [
    { value: 'gpt-4', label: 'GPT-4 (OpenAI)', description: 'Advanced language model' },
    { value: 'claude-3', label: 'Claude 3 (Anthropic)', description: 'Safe and capable AI' },
    { value: 'llama-3', label: 'Llama 3 (Meta)', description: 'Open weights model' },
    { value: 'gemini', label: 'Gemini (Google)', description: 'Multimodal AI' },
    { value: 'mistral', label: 'Mistral', description: 'Efficient open models' },
]

export const vectorDbVendors: VendorOption[] = [
    { value: 'pinecone', label: 'Pinecone', description: 'Managed vector database' },
    { value: 'weaviate', label: 'Weaviate', description: 'AI-first vector database' },
    { value: 'milvus', label: 'Milvus', description: 'Cloud-native vector database' },
    { value: 'qdrant', label: 'Qdrant', description: 'Vector similarity search' },
    { value: 'chroma', label: 'Chroma', description: 'AI-native open-source embedding database' },
]

export const aiAgentVendors: VendorOption[] = [
    { value: 'langchain', label: 'LangChain', description: 'Framework for LLM apps' },
    { value: 'autogen', label: 'AutoGen', description: 'Multi-agent framework' },
    { value: 'crewai', label: 'CrewAI', description: 'Orchestrating role-playing agents' },
    { value: 'superagi', label: 'SuperAGI', description: 'Autonomous AI agent framework' },
]

export const mlTrainingVendors: VendorOption[] = [
    { value: 'sagemaker', label: 'SageMaker', description: 'Build, train, deploy' },
    { value: 'vertex-ai', label: 'Vertex AI', description: 'Unified AI platform' },
    { value: 'azure-ml', label: 'Azure ML', description: 'Enterprise-grade AI' },
    { value: 'databricks', label: 'Databricks Mosaic', description: 'Generative AI training' },
]

export const mlInferenceVendors: VendorOption[] = [
    { value: 'sagemaker-endpoints', label: 'SageMaker Endpoints', description: 'Real-time inference' },
    { value: 'vertex-prediction', label: 'Vertex Prediction', description: 'Model serving' },
    { value: 'kserve', label: 'KServe', description: 'Standardized inference' },
    { value: 'vllm', label: 'vLLM', description: 'High-throughput serving' },
]

export const pipelineVendors: VendorOption[] = [
    { value: 'airflow', label: 'Airflow', description: 'Workflow management' },
    { value: 'prefect', label: 'Prefect', description: 'Modern monitoring' },
    { value: 'dagster', label: 'Dagster', description: 'Data orchestrator' },
    { value: 'kubeflow', label: 'Kubeflow', description: 'ML toolkit for K8s' },
]

export const firewallVendors: VendorOption[] = [
    { value: 'palo-alto', label: 'Palo Alto', description: 'NetSec Platform' },
    { value: 'cisco-asa', label: 'Cisco ASA', description: 'Adaptive Security' },
    { value: 'fortigate', label: 'FortiGate', description: 'Next-Gen Firewall' },
    { value: 'pfsense', label: 'pfSense', description: 'Open Source Security' },
]

export const mdmVendors: VendorOption[] = [
    { value: 'informatica-mdm', label: 'Informatica MDM', description: 'Enterprise MDM' },
    { value: 'tibco-ebx', label: 'TIBCO EBX', description: 'Data management' },
    { value: 'semarchy', label: 'Semarchy', description: 'Unified data platform' },
    { value: 'ataccama', label: 'Ataccama', description: 'Self-driving data management' },
]

export const serviceDiscoveryVendors: VendorOption[] = [
    { value: 'consul', label: 'Consul', description: 'Service discovery and config' },
    { value: 'etcd', label: 'etcd', description: 'Distributed key-value store' },
    { value: 'zookeeper', label: 'ZooKeeper', description: 'Coordination service' },
    { value: 'eureka', label: 'Eureka', description: 'Netflix service discovery' },
    { value: 'coredns', label: 'CoreDNS', description: 'DNS server' },
]

export const vpcVendors: VendorOption[] = [
    { value: 'aws-vpc', label: 'AWS VPC', description: 'Virtual Private Cloud' },
    { value: 'azure-vnet', label: 'Azure VNet', description: 'Virtual Network' },
    { value: 'gcp-vpc', label: 'Google VPC', description: 'Global VPC' },
    { value: 'oci-vcn', label: 'OCI VCN', description: 'Virtual Cloud Network' },
]

export const subnetVendors: VendorOption[] = [
    { value: 'public-subnet', label: 'Public Subnet', description: 'Internet accessible' },
    { value: 'private-subnet', label: 'Private Subnet', description: 'Isolated network' },
    { value: 'isolated-subnet', label: 'Isolated Subnet', description: 'No internet access' },
]

export const routingTableVendors: VendorOption[] = [
    { value: 'aws-route-table', label: 'AWS Route Table', description: 'VPC routing' },
    { value: 'azure-route-table', label: 'Azure Route Table', description: 'UDR' },
    { value: 'gcp-routes', label: 'Google Cloud Routes', description: 'VPC routes' },
]

export const wafVendors: VendorOption[] = [
    { value: 'aws-waf', label: 'AWS WAF', description: 'Web Application Firewall' },
    { value: 'azure-waf', label: 'Azure WAF', description: 'App Gateway WAF' },
    { value: 'cloudflare-waf', label: 'Cloudflare WAF', description: 'Edge security' },
    { value: 'imperva', label: 'Imperva', description: 'App security' },
    { value: 'f5-big-ip', label: 'F5 BIG-IP', description: 'Advanced WAF' },
]

export const ddosVendors: VendorOption[] = [
    { value: 'aws-shield', label: 'AWS Shield', description: 'DDoS protection' },
    { value: 'azure-ddos', label: 'Azure DDoS Protection', description: 'Network protection' },
    { value: 'cloudflare-ddos', label: 'Cloudflare DDoS', description: 'Unmetered mitigation' },
    { value: 'akamai-prolexic', label: 'Akamai Prolexic', description: 'DDoS defense' },
]

export const hsmVendors: VendorOption[] = [
    { value: 'aws-cloudhsm', label: 'AWS CloudHSM', description: 'Hardware Security Module' },
    { value: 'azure-dedicated-hsm', label: 'Azure Dedicated HSM', description: 'FIPS 140-2 Level 3' },
    { value: 'google-cloud-hsm', label: 'Google Cloud HSM', description: 'Managed HSM service' },
    { value: 'thales', label: 'Thales Luna', description: 'Enterprise HSM' },
]

export const kmsVendors: VendorOption[] = [
    { value: 'aws-kms', label: 'AWS KMS', description: 'Key Management Service' },
    { value: 'azure-key-vault', label: 'Azure Key Vault', description: 'Key and secret management' },
    { value: 'google-kms', label: 'Google Cloud KMS', description: 'Cryptographic keys' },
    { value: 'hashicorp-vault', label: 'HashiCorp Vault', description: 'Secrets engine' },
]

export const transitGatewayVendors: VendorOption[] = [
    { value: 'aws-transit-gateway', label: 'AWS Transit Gateway', description: 'Network hub' },
    { value: 'azure-virtual-wan', label: 'Azure Virtual WAN', description: 'Unified connectivity' },
    { value: 'google-ncc', label: 'Google NCC', description: 'Network Connectivity Center' },
]

export const directConnectVendors: VendorOption[] = [
    { value: 'aws-direct-connect', label: 'AWS Direct Connect', description: 'Dedicated network connection' },
    { value: 'azure-expressroute', label: 'Azure ExpressRoute', description: 'Private connection' },
    { value: 'google-interconnect', label: 'Google Cloud Interconnect', description: 'Enterprise connectivity' },
]

export const containerRegistryVendors: VendorOption[] = [
    { value: 'ecr', label: 'Amazon ECR', description: 'Elastic Container Registry' },
    { value: 'acr', label: 'Azure ACR', description: 'Container Registry' },
    { value: 'gcr', label: 'Google GCR', description: 'Container Registry' },
    { value: 'docker-hub', label: 'Docker Hub', description: 'Public/Private registry' },
    { value: 'harbor', label: 'Harbor', description: 'Open source registry' },
]

export const batchProcessorVendors: VendorOption[] = [
    { value: 'apache-airflow', label: 'Apache Airflow', description: 'Programmatic platform for workflows' },
    { value: 'luigi', label: 'Luigi', description: 'Python module for batch jobs' },
    { value: 'prefect', label: 'Prefect', description: 'Modern workflow orchestration' },
    { value: 'aws-batch', label: 'AWS Batch', description: 'Fully managed batch processing' },
    { value: 'azure-batch', label: 'Azure Batch', description: 'Cloud-scale job scheduling' },
    { value: 'google-cloud-composer', label: 'Cloud Composer', description: 'Managed Airflow service' },
    { value: 'dagster', label: 'Dagster', description: 'Data orchestrator' },
    { value: 'argo-workflows', label: 'Argo Workflows', description: 'Workflow engine for Kubernetes' },
    { value: 'kubeflow', label: 'Kubeflow', description: 'ML toolkit for Kubernetes' },
    { value: 'step-functions', label: 'AWS Step Functions', description: 'Visual workflow orchestrator' },
    { value: 'dask', label: 'Dask', description: 'Parallel computing with Python' },
    { value: 'apache-beam', label: 'Apache Beam', description: 'Unified programming model' },
]

export const clientVendors: VendorOption[] = [
    { value: 'web-client', label: 'Web Client', description: 'Browser-based application' },
    { value: 'mobile-client', label: 'Mobile Client', description: 'iOS or Android app' },
    { value: 'desktop-client', label: 'Desktop Client', description: 'Windows/macOS/Linux application' },
    { value: 'iot-device', label: 'IoT Device', description: 'Embedded system or sensor' },
    { value: 'external-user', label: 'External User', description: 'Third-party accessing the system' },
    { value: 'internal-user', label: 'Internal User', description: 'Employee or administrator' },
]

export const workerVendors: VendorOption[] = [
    { value: 'celery', label: 'Celery', description: 'Distributed task queue for Python' },
    { value: 'sidekiq', label: 'Sidekiq', description: 'Background processing for Ruby' },
    { value: 'bull', label: 'Bull', description: 'Redis-based queue for Node.js' },
    { value: 'resque', label: 'Resque', description: 'Redis-backed Ruby library for background jobs' },
    { value: 'hangfire', label: 'Hangfire', description: 'Background job processing for .NET' },
    { value: 'aws-sqs-worker', label: 'SQS Worker', description: 'AWS SQS consumer' },
]

export const backgroundTaskVendors: VendorOption[] = [
    { value: 'async-task', label: 'Async Task', description: 'Asynchronous background task' },
    { value: 'delayed-job', label: 'Delayed Job', description: 'Database-backed asynchronous priority queue' },
    { value: 'cron-job', label: 'Cron Job', description: 'Scheduled background task' },
    { value: 'lambda-async', label: 'Lambda Async', description: 'AWS Lambda asynchronous invocation' },
]

export const featureFlagsVendors: VendorOption[] = [
    { value: 'launchdarkly', label: 'LaunchDarkly', description: 'Feature management platform' },
    { value: 'unleash', label: 'Unleash', description: 'Open source feature toggle system' },
    { value: 'split', label: 'Split', description: 'Feature delivery platform' },
    { value: 'flagsmith', label: 'Flagsmith', description: 'Open source feature flag service' },
    { value: 'growthbook', label: 'GrowthBook', description: 'Open source feature flagging and A/B testing' },
    { value: 'configcat', label: 'ConfigCat', description: 'Feature flag service' },
]

export const healthCheckVendors: VendorOption[] = [
    { value: 'kubernetes-probe', label: 'Kubernetes Probes', description: 'Liveness, readiness, startup probes' },
    { value: 'spring-actuator', label: 'Spring Boot Actuator', description: 'Production-ready features' },
    { value: 'express-healthcheck', label: 'Express Healthcheck', description: 'Node.js health endpoint' },
    { value: 'aws-health', label: 'AWS Health', description: 'Service health dashboard' },
    { value: 'custom-endpoint', label: 'Custom Health Endpoint', description: '/health or /healthz endpoint' },
]

export const configStoreVendors: VendorOption[] = [
    { value: 'consul', label: 'Consul', description: 'Service mesh and configuration' },
    { value: 'etcd', label: 'etcd', description: 'Distributed key-value store' },
    { value: 'zookeeper', label: 'Apache ZooKeeper', description: 'Centralized configuration service' },
    { value: 'aws-appconfig', label: 'AWS AppConfig', description: 'Application configuration service' },
    { value: 'azure-app-config', label: 'Azure App Configuration', description: 'Centralized configuration management' },
    { value: 'spring-cloud-config', label: 'Spring Cloud Config', description: 'Externalized configuration' },
    { value: 'dotenv', label: 'Environment Variables', description: '.env files and environment config' },
]

export const vcsVendors: VendorOption[] = [
    { value: 'github', label: 'GitHub', description: 'Cloud repository hosting' },
    { value: 'gitlab', label: 'GitLab', description: 'DevOps lifecycle tool' },
    { value: 'bitbucket', label: 'Bitbucket', description: 'Git repository management' },
    { value: 'azure-devops', label: 'Azure Repos', description: 'Private Git repositories' },
    { value: 'aws-codecommit', label: 'AWS CodeCommit', description: 'Source control service' },
    { value: 'gitea', label: 'Gitea', description: 'Self-hosted Git service' },
]

