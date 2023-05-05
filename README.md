# TranslateGPT
This software has not been fully tested, please wait.

+ [Introduction in English](#introduction-in-english)
+ [中文介绍](#中文介绍)

<div align="center">
<img src="https://github.com/wuhuawei1996/wuhuawei1996.github.io/blob/main/pictures/screenshot_4.gif" width="70%"  />
</div>



## Introduction in English
A ChatGPT-based translation application developed using Tauri, with main features including translation by selecting, translation by screenshot and paper proofreading.

## 中文介绍
一个基于 ChatGPT 的翻译软件，使用 Tauri 开发，主要功能包括划词翻译、截图翻译和论文润色。


<div align="center">
<img src="https://github.com/wuhuawei1996/wuhuawei1996.github.io/blob/main/pictures/screenshot_6.gif" width="80%"  />
</div>



### 关于设置
#### 语言
安装并启动软件后，可以先在 ```设置 - 基础设置``` 中设置系统的语言。本软件目前支持简体中文、英语两种语言。如果有熟悉其它语言的热心的用户，想要帮助我翻译软件中出现的所有文字，请通过邮件联系我。
#### 划词/截屏时打开主窗口
默认情况下，当你按下划词/截屏的相应快捷键时，翻译/润色的结果会以小窗口的形式呈现。但是如果勾选了 ```划词/截屏时打开主窗口```，在按下快捷键的时候，主窗口就会弹出，并呈现结果。
#### 字体大小
本软件预置了四种字体大小，但该值只会影响主窗口中翻译/润色的原始内容和结果区域。
#### API 密钥
为了使用翻译/润色功能，用户需要先申请或购买相应模型/接口的 API 密钥。软件目前只支持 ```gpt-3.5-turbo``` 模型，预计未来会支持 ```gpt-4``` 模型、```Google 翻译``` 和 ```DeepL 翻译```。之所以还没有做，是因为开发者没有国外的信用卡，因此无法申请和测试。
#### 快捷键
开发者认为，使用适当的快捷键，可以极大地提高工作效率，因此本软件中的所有快捷键都可由用户自定义。
### 翻译
翻译前需要选择翻译引擎、源语言及目标语言。如果使用的是 ```gpt-3.5-turbo``` 这类 NLP 模型，建议将源语言选择为 ```自动检测``` 即可。如果源语言与目标语言一致，翻译的结果可能会令人匪夷所思，这是模型的特点导致的。
#### 划词翻译
用鼠标选中要翻译的文字后，按下快捷键，就会启动划词翻译，并根据用户的选择将结果呈现在小窗口/主窗口当中。与普通翻译一样，划词翻译不需要指定源语言，建议选择 ```自动检测``` 。
#### 截屏翻译
按下快捷键后，会出现截屏的界面。选择好要截取的区域后，点击 ```√``` 按钮，软件就会开始识别所选区域中的文字，然后将识别出的文字传给相应的引擎进行翻译。如果用户想要放弃截取的区域，可以点击 ```×``` 按钮或按下 ```Esc``` 键。

本软件使用开源 OCR 引擎 [Tesseract.js](https://github.com/naptha/tesseract.js) 来进行文字识别。根据开发者测试，绝大多数常见语言的识别效果都很好，除了简体中文与繁体中文。为此，开发者做了一些优化，一定程度上提升了这两种语言的识别效果。要注意的是，与划词翻译不同，<ins>截屏翻译必须要指定源语言</ins>，否则文字识别效果会佷差。此外，第一次识别某种语言的时候，需要下载相应的语言包，所以花费时间会比较久，之后就不用等待这么长时间。

<div align="center">
<img src="https://github.com/wuhuawei1996/wuhuawei1996.github.io/blob/main/pictures/screenshot_5.gif" width="100%"  />
</div>


#### 提示词
根据开发者观察，对于 ```gpt-3.5-turbo``` 这类 NLP 模型，提供相应的关键词，可以有效地提升翻译质量。提示的格式为：“提示1+提示2+提示3...”。比如我想要翻译的内容来自法国数学家 Bertholot 的一篇关于 Arithmetic D-modules 的论文，我就可以输入提示词：Bertholot + Arithmetirc D-modules + Rigid Cohomlogy + Algebraic Geometry。建议使用英文的提示词，否则可能出现令人匪夷所思的结果。这个功能开发者并没有进行充分地研究与调试，如果用户有自己的心得体会，请通过邮件与开发者进行分享，谢谢！

### 润色
润色的绝大数内容与翻译相同，这里只阐述不同的。
#### 部分润色
在主窗口的 ```润色``` 界面，如果用户不想对原始内容区域中的所有内容进行润色，可以只用鼠标高亮选择部分内容，然后按下 ```润色``` 按钮，这样只会将选择的部分作为润色的对象。如果用户没有选择任何内容，则默认对所有内容进行润色。
#### 润色结果
与翻译不同，润色结果是呈现在一个可编辑的区域中，并且每次润色不会覆盖原有的内容，而是接到原有内容的后面。这与上一点一样，都是为了提高润色功能的交互性。开发者想象的场景是用户复制一大段内容到待润色区域，然后每次润色一小段，观察润色的结果后进行手动修改，反复进行，最终将编辑好的结果复制粘贴出去即可。这样的操作流程，无需反复进行窗口切换。
#### 小窗口
根据用户的设置，翻译/润色的结果会呈现在小窗口或主窗口中。要注意的是，<ins>小窗口和主窗口中的设置是独立的</ins>。如果用户觉得结果太长，不方便在小窗口中阅读，可以点击小窗口右上方的 ```发送数据到主窗口``` 按钮，就会将原始内容和结果都同步到主窗口中——此操作还会将小窗口中的引擎及语言设置同步到主窗口中。

每次小窗口弹出时，是默认没有头部栏的。此时如果用户在小窗口外的地方进行了点击，小窗口就会自动消失。如果用户先将鼠标移到了小窗口上，头部栏就会自动出现，并且之后只有用户按下了右上方的 ```关闭``` 按钮或再次按下快捷键，小窗口才会消失。

许多用户会有困惑：每次小窗口弹出时，我还来不及选择引擎和语言，就已经在进行翻译/润色工作了，怎样才能先调出小窗口设置引擎和语言呢？这里的一个技巧是：在不选择任何内容的情况下，按下 ```划词翻译``` 的快捷键。这样做小窗口就会弹出，并提示“未选择要xx的内容”，但不会进行翻译/润色。


### 致谢

### 赞助
这是开发者开源的第一个完整的项目，虽不复杂，也并不简单。事实上，开发过有图形界面的程序的开发者都知道，为了做出好看的 UI、为了提供舒适的交互体验、为了预判用户可能产生的错误操作，需要花费大量的时间的精力。如果你觉得这个软件帮助到了你，请给这个项目加颗星，也可以请我喝一杯咖啡。下面是我的支付宝收款码：

<div align="center">
<img src="https://github.com/wuhuawei1996/TranslatorGPT/blob/master/src/assets/imgs/alipay.jpg" width="30%" />
</div>


