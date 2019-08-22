package word;

import java.awt.Desktop;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.apache.poi.xwpf.converter.core.FileImageExtractor;
import org.apache.poi.xwpf.converter.core.FileURIResolver;
import org.apache.poi.xwpf.converter.xhtml.XHTMLConverter;
import org.apache.poi.xwpf.converter.xhtml.XHTMLOptions;
import org.apache.poi.xwpf.usermodel.XWPFDocument;

public class DocxHtmlTest {
//	static Logger objLog = Logger.getLogger(DocxHtmlTest.class);

	public static void main(String[] args) {
		// 処理前の時刻を取得
		long startTime = System.currentTimeMillis();

		//設定

		String strFilePath = "C:/Users/ueda tatsuya/Desktop/poisample-master/test2.docx";
		String strCopyPath = strFilePath + "_" + System.currentTimeMillis() + ".html";
//		String strFilePath = "C:/Users/ueda tatsuya/Desktop/poisample-master/test.doc";
//		String strCopyPath = strFilePath + "_" + System.currentTimeMillis() + ".doc";


		DocxHtmlTest objWordTest = new DocxHtmlTest();
		objWordTest.docxToHtml(strFilePath, strCopyPath);

		// 処理後の時刻を取得
		long endTime = System.currentTimeMillis();

//		objLog.info("開始時刻：" + startTime + " ms");
//		objLog.info("終了時刻：" + endTime + " ms");
//		objLog.info("処理時間：" + (endTime - startTime) + " ms");
		File objMakeFile = new File(strCopyPath);
		try {
			Desktop.getDesktop().open(objMakeFile);
		} catch (IOException e) {
			e.printStackTrace();
		} //try


	} //main


	/**
	 * @param strFilePath_i
	 * @param strOutPath_i
	 * @param strMaskMsg_i
	 */
	public void docxToHtml(String strFilePath_i, String strOutPath_i) {
		InputStream objIS;
		OutputStream objOs;
		try {
	        objIS= new FileInputStream(new File(strFilePath_i));

	        File imageFolderFile = new File("C:/pleiades_4_8/workspace2/01_apachPoiTest2/word/media/image.png");
	        XWPFDocument objXWPDDoc = new XWPFDocument(objIS);
	        XHTMLOptions objOpt = XHTMLOptions.create().URIResolver(new FileURIResolver(new File("C:/pleiades_4_8/workspace2/01_apachPoiTest2/word/media/image1.png")));
//	        XHTMLOptions objOpt = XHTMLOptions.create().URIResolver(new FileURIResolver(new File("")));
	        objOpt.setExtractor(new FileImageExtractor(imageFolderFile));
	        File objOutHtml = new File(strOutPath_i);
	        objOs = new FileOutputStream(objOutHtml);
//	        objOs = new ByteArrayOutputStream();
	        XHTMLConverter.getInstance().convert(objXWPDDoc, objOs, objOpt);
	        String strHtml=objOs.toString();
	        System.out.println(strHtml);

	        objIS.close();
	        objIS = null;
		} catch (IOException e1) {
			// TODO 自動生成された catch ブロック
			e1.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} //try
	} 	//wordSetMask


} //WordTest
