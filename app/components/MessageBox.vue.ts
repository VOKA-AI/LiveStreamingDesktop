import TsxComponent, { createProps } from 'components/tsx-component';
import { Component, Prop } from 'vue-property-decorator';

class ChatBoxProps {
  username: String = "";
  message: String = "";
}

@Component({
  components: {},
  props: createProps(ChatBoxProps),
})

export default class ChatBox extends TsxComponent<ChatBoxProps> {
  @Prop({ default: "" }) message: String;
  @Prop({ default: "" }) username: String;
}

