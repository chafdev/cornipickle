/*
    Cornipickle, validation of layout bugs in web applications
    Copyright (C) 2015 Sylvain Hallé

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package ca.uqac.lif.cornipickle;

import java.util.Iterator;
import java.util.Map;
import java.util.LinkedList;
import java.util.List;

import ca.uqac.lif.cornipickle.json.JsonElement;
import ca.uqac.lif.cornipickle.json.JsonNumber;

public class EventuallyWithin extends Globally
{
  protected NumberConstant m_timestamp;
  protected long m_future_timestamp;
  protected List<Verdict> prev_st_v;

  public EventuallyWithin(NumberConstant timestamp)
  {
    //Set a list of verdicts from previous evaluated statements
    //To keep track of verdicts before the time limit
    prev_st_v = new LinkedList<Verdict>();
    prev_st_v.add(new Verdict(Verdict.Value.INCONCLUSIVE));

    m_timestamp = timestamp;
    JsonNumber eval_timestamp = (JsonNumber) m_timestamp.evaluate(null, null);
    m_future_timestamp =  java.lang.System.currentTimeMillis() + 
                        eval_timestamp.numberValue().longValue() * 1000;
  }

  @Override
  public Verdict evaluateTemporal(JsonElement j, Map<String, JsonElement> d)
  { 
    long currentTime = java.lang.System.currentTimeMillis();
    // Instantiate new inner statement
    Statement new_s = m_innerStatement.getClone();
    m_inMonitors.add(new_s);
    // Evaluate each
    Iterator<Statement> it = m_inMonitors.iterator();
    Iterator<Verdict> it_prev_v = prev_st_v.iterator();

    while (it.hasNext())
    {
      Statement st = it.next();
      Verdict prev_verdict = it_prev_v.next();
      Verdict st_v = st.evaluate(j, d);

      //still below time limit
      if (currentTime <= m_future_timestamp) 
      {
        if (st_v.is(Verdict.Value.TRUE)) 
        {
          m_verdict.setValue(Verdict.Value.TRUE);
          m_verdict.setWitnessTrue(st_v.getWitnessTrue());
          break;
        }
        //only keep the previous verdict when below time limit
        prev_st_v.add(st_v);
      }
      //passed time limit
      else 
      {
        //If the verdict did not become true in time, will always be false
        if (!prev_verdict.is(Verdict.Value.TRUE))
        {
          m_verdict.setValue(Verdict.Value.FALSE);
          m_verdict.setWitnessFalse(st_v.getWitnessFalse());
          it.remove();
          it_prev_v.remove();
        }
      }
    }
    
    return m_verdict;
  }

  @Override
  public String toString(String indent)
  {
    StringBuilder out = new StringBuilder();
    out.append(indent).append("Eventually within " + m_timestamp + " seconds (\n");
    out.append(m_innerStatement.toString(indent + "  "));
    out.append("\n").append(indent).append(")");
    return out.toString();
  }

  @Override
  public Statement getClone()
  {
    Eventually out = new Eventually();
    out.setInnerStatement(m_innerStatement.getClone());
    return out;
  }

  private String booleanToString(boolean b) 
  {
    if (b) return "TRUE";
    else return "FALSE";
  }

}
