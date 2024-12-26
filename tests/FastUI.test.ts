import { it, describe } from 'bun:test';
import { Alignment, FastContainer, FastUI, FlexContainer, Fonts, Text } from '../src';

describe('FastUI Tests', () => {
    it(`should create a nice image`, async () => {
        const ui = new FastUI({ width: 1280, height: 720, backgroundUrl: `./tests/assets/botzFastbanner.png`, backgroundTransparency: 0 });

        const container = new FastContainer({ width: 500, height: 500, color: 'red', align: Alignment.CENTER });
        const container2 = new FastContainer({ width: 500, height: 500, color: 'blue', align: Alignment.RIGHT });

        const flexContainer = new FlexContainer({ width: 500, height: 500, direction: 'col' });
        const flexContainer2 = new FlexContainer({ width: 500, height: 500, direction: 'col' });

        const text1 = new Text({ text: 'Hello world', fontSize: 40, color: 'white', fontFamily: Fonts.Arial, bold: true });
        const text2 = new Text({ text: 'Hello world', fontSize: 40, color: 'white', fontFamily: Fonts.Arial, bold: true });

        const text3 = new Text({ text: 'Hello world!!', fontSize: 40, color: 'white', fontFamily: Fonts.Arial, bold: true });
        const text4 = new Text({ text: 'Hello world!!', fontSize: 40, color: 'white', fontFamily: Fonts.Arial, bold: true });

        flexContainer.add([text1, text2])
        flexContainer2.add([text3, text4])

        container.addContainers([flexContainer])
        container2.addContainers([flexContainer2])
        ui.add([container, container2]);
        await ui.render(`./tests/generated-images`)
    })
})