import React, {useState} from 'react';
import {Form, Button, Input, Modal, Select,Divider,Space,Switch} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type {ClusterConfigurationTableListItem} from "@/pages/ClusterConfiguration/data";
import {getConfig, getConfigFormValues} from "@/pages/ClusterConfiguration/function";
import {FLINK_CONFIG_LIST, HADOOP_CONFIG_LIST} from "@/pages/ClusterConfiguration/conf";
import type {Config} from "@/pages/ClusterConfiguration/conf";
import {testClusterConfigurationConnect} from "@/pages/ClusterConfiguration/service";

export type ClusterConfigurationFormProps = {
  onCancel: (flag?: boolean) => void;
  onSubmit: (values: Partial<ClusterConfigurationTableListItem>) => void;
  modalVisible: boolean;
  values: Partial<ClusterConfigurationTableListItem>;
};
const {Option} = Select;

const formLayout = {
  labelCol: {span: 7},
  wrapperCol: {span: 13},
};

const ClusterConfigurationForm: React.FC<ClusterConfigurationFormProps> = (props) => {

  const [form] = Form.useForm();
  const [formVals, setFormVals] = useState<Partial<ClusterConfigurationTableListItem>>({
    id: props.values.id,
    name: props.values.name,
    alias: props.values.alias,
    type: props.values.type?props.values.type:"Yarn",
    configJson: props.values.configJson,
    note: props.values.note,
    enabled: props.values.enabled,
  });

  const {
    onSubmit: handleSubmit,
    onCancel: handleModalVisible,
    modalVisible,
  } = props;

  const buildConfig = (config: Config[]) =>{
    const itemList: JSX.Element[] = [];
    config.forEach(configItem => {
      itemList.push(<Form.Item
        name={configItem.name}
        label={configItem.lable}
      >
        <Input placeholder={configItem.placeholder}/>
      </Form.Item>)
    });
    return itemList;
  };

  const submitForm = async () => {
    const fieldsValue = await form.validateFields();
    const formValues = {
      id:formVals.id,
      name:fieldsValue.name,
      alias:fieldsValue.alias,
      type:fieldsValue.type,
      note:fieldsValue.note,
      enabled:fieldsValue.enabled,
      configJson:JSON.stringify(getConfig(fieldsValue)),
    };
    setFormVals(formValues);
    handleSubmit(formValues);
  };

  const renderContent = (formValsPara: Partial<ClusterConfigurationTableListItem>) => {
    return (
      <>
        <Form.Item
          name="type"
          label="类型"
        >
          <Select defaultValue="Yarn" value="Yarn">
            <Option value="Yarn">Flink On Yarn</Option>
            <Option value="Kubernetes">Flink On Kubernetes</Option>
          </Select>
        </Form.Item>
        <Divider>Hadoop 配置</Divider>
        <Form.Item
          name="hadoopConfigPath"
          label="配置文件路径"
          rules={[{required: true, message: '请输入 hadoop 配置文件路径！'}]}
          help="指定配置文件路径（末尾无/），需要包含以下文件：core-site.xml,hdfs-site.xml,yarn-site.xml"
        >
          <Input placeholder="值如 /usr/local/dlink/conf"/>
        </Form.Item>
        <Divider orientation="left" plain>自定义配置（高优先级）</Divider>
        {buildConfig(HADOOP_CONFIG_LIST)}
        <Form.Item
          label="其他配置"
        >
        <Form.List name="hadoopConfigList">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Space key={key} style={{ display: 'flex' }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    fieldKey={[fieldKey, 'name']}
                  >
                    <Input placeholder="name" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    fieldKey={[fieldKey, 'value']}
                  >
                    <Input placeholder="value" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加一个自定义项
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        </Form.Item>
        <Divider>Flink 配置</Divider>
        <Form.Item
          name="flinkLibPath"
          label="lib 路径"
          rules={[{required: true, message: '请输入 lib 的 hdfs 路径！'}]}
          help="指定 lib 的 hdfs 路径（末尾无/），需要包含 Flink 运行时的依赖"
        >
          <Input placeholder="值如 hdfs:///flink/lib"/>
        </Form.Item>
        <Form.Item
          name="flinkConfigPath"
          label="配置文件路径"
          rules={[{required: true, message: '请输入 flink-conf.yaml 路径！'}]}
          help="指定 flink-conf.yaml 的具体路径"
        >
          <Input placeholder="值如 /usr/local/dlink/conf/flink-conf.yaml"/>
        </Form.Item>
        <Divider orientation="left" plain>自定义配置（高优先级）</Divider>
        {buildConfig(FLINK_CONFIG_LIST)}
        <Form.Item
          label="其他配置"
        >
        <Form.List name="flinkConfigList">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    fieldKey={[fieldKey, 'name']}
                  >
                    <Input placeholder="name" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    fieldKey={[fieldKey, 'value']}
                  >
                    <Input placeholder="value" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加一个自定义项
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        </Form.Item>
        <Divider>基本配置</Divider>
        <Form.Item
          name="name"
          label="标识"
          rules={[{required: true, message: '请输入名称！'}]}>
          <Input placeholder="请输入唯一英文标识"/>
        </Form.Item>
        <Form.Item
          name="alias"
          label="名称"
        >
          <Input placeholder="请输入名称"/>
        </Form.Item>
        <Form.Item
          name="note"
          label="注释"
        >
          <Input.TextArea placeholder="请输入文本注释" allowClear
                          autoSize={{minRows: 3, maxRows: 10}}/>
        </Form.Item>
        <Form.Item
          name="enabled"
          label="是否启用">
          <Switch checkedChildren="启用" unCheckedChildren="禁用"
                  defaultChecked={formValsPara.enabled}/>
        </Form.Item>
      </>
    );
  };

  const testForm = async ()=>{
    const fieldsValue = await form.validateFields();
    const formValues = {
      id :formVals.id,
      name:fieldsValue.name,
      alias:fieldsValue.alias,
      type:fieldsValue.type,
      note:fieldsValue.note,
      enabled:fieldsValue.enabled,
      configJson:JSON.stringify(getConfig(fieldsValue)),
    } as ClusterConfigurationTableListItem;
    setFormVals(formValues);
    testClusterConfigurationConnect(formValues);
  };

  const renderFooter = () => {
    return (
      <>
        <Button onClick={() => handleModalVisible(false)}>取消</Button>
        <Button type="primary" htmlType="button" onClick={testForm}>
          测试
        </Button>
        <Button type="primary" onClick={() => submitForm()}>
          完成
        </Button>
      </>
    );
  };

  return (
    <Modal
      width={1200}
      bodyStyle={{padding: '32px 40px 48px'}}
      destroyOnClose
      title={formVals.id?"维护集群配置":"创建集群配置"}
      visible={modalVisible}
      footer={renderFooter()}
      onCancel={() => handleModalVisible()}
    >
      <Form
        {...formLayout}
        form={form}
        initialValues={getConfigFormValues(formVals)}
      >
        {renderContent(formVals)}
      </Form>
    </Modal>
  );
};

export default ClusterConfigurationForm;
