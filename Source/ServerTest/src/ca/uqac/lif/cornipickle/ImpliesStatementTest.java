package ca.uqac.lif.cornipickle;

import java.util.HashMap;
import java.util.Map;

import ca.uqac.lif.bullwinkle.ParseNode;
import ca.uqac.lif.json.JsonElement;
import ca.uqac.lif.json.JsonString;

import org.junit.Before;
import org.junit.Test;

import static ca.uqac.lif.cornipickle.UtilsTest.shouldParseAndNotNull;
import static org.junit.Assert.*;

public class ImpliesStatementTest {

    CornipickleParser parser;
    ImpliesStatement is;


    @Before
    public void setUp() {
        parser = new CornipickleParser();

        String line = "If ( \"3\" equals \"3\") Then ( \"3\" equals \"3\")\n";

        ParseNode pn = shouldParseAndNotNull(parser, line, "<implies>");
        LanguageElement e = parser.parseStatement(pn);

        if (e == null)
        {
            fail("Parsing returned null");
        }
        if (!(e instanceof ImpliesStatement))
        {
            fail("Got wrong type of object");
        }
        is = (ImpliesStatement)e;
    }
    
    
    @Test
    public void ImpliesStatementTestToString(){
        String expected = "If (\n" +
                "3 equals 3)\n" +
                "Then (\n" +
                "3 equals 3)";

        assertTrue(expected.equals(is.toString()));
    }

    @Test
    public void ImpliesStatementTestGetClone(){
        ImpliesStatement is2 = (ImpliesStatement)is.getClone();
        boolean ok = true;

        for (int i = 0; i < is.getStatements().size(); i++) {

            String s1 = is.getStatements().get(i).toString();
            String s2 = is2.getStatements().get(i).toString();

            if (!s1.equals(s2)){
                ok = false;
            }
        }

        assertTrue(ok);
    }
    @Test
    public void ImpliesStatementTestEvaluateATemporal(){
    	JsonElement je =new JsonString("cornipickle");    	
    	Map<String, JsonElement> map = new HashMap<String, JsonElement>();
    	assertTrue(is.evaluateAtemporal(je, map).getValue().equals(Verdict.Value.TRUE));
    }
    
    @Test
    public void ImpliesStatementTestEvaluateATemporal2(){
        String line = "If ( \"3\" equals \"3\") Then ( \"4\" equals \"3\")\n";

        ParseNode pn = shouldParseAndNotNull(parser, line, "<implies>");
        LanguageElement e = parser.parseStatement(pn);

        if (e == null)
        {
            fail("Parsing returned null");
        }
        if (!(e instanceof ImpliesStatement))
        {
            fail("Got wrong type of object");
        }
        is = (ImpliesStatement)e;
    	JsonElement je =new JsonString("cornipickle");    	
    	Map<String, JsonElement> map = new HashMap<String, JsonElement>();
    	assertTrue(is.evaluateAtemporal(je, map).getValue().equals(Verdict.Value.FALSE));
    }


}
